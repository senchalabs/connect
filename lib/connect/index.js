
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Framework version.
 */

exports.version = '0.0.5';

/**
 * Module dependencies.
 */

var sys = require('sys'),
    http = require('http'),
    Url = require('url'),
    Path = require('path'),
    assert = require('assert')
    utils = require('./utils');

// Response extensions

require('./response');

// Extensions

if (typeof Object.prototype.forEach !== 'function') {
    Object.defineProperty(Object.prototype, 'forEach', {
        value: function(fn, scope){
            var keys = Object.keys(this);
            for (var i = 0, len = keys.length; i < len; ++i) {
                fn.call(scope, this[keys[i]], keys[i], this);
            }
        }
    });
}

/**
 * Initialize middleware Layer.
 *
 * @param  {Object} config
 * @api private
 */

function Layer(config) {
    utils.merge(this, config);
    utils.merge(this, config.module);

    // Normalize routes
    if (this.route[this.route.length - 1] !== '/') {
        this.route = this.route + '/';
    }
}

Layer.prototype = {
    name: 'unnamed',
    route: '/',

    /**
     * Default layer handle, pass-through.
     */

    handle: function(req, res, next) {
        next();
    }
};

/**
 * Setup the given middleware configurations.
 *
 * The first value in each configuration array
 * may be an string or array of paths to match,
 * followed by the module object or name. All additional
 * arguments are passed to the optional setup function.
 *
 *   Connect.run(
 *      { filter: "log" },
 *      { provider: "static", param: __dirname + '/public' }
 *   )
 *
 * @param  {Array} middleware
 * @param  {Object} env
 * @return {Server}
 * @api public
 */

var Server = exports.Server = function Server(configs, env) {
    configs = configs || [];
    this.env = env || process.connectEnv || {};
    this.env.server = this;
    this.stack = [];
    configs.forEach(function(obj){ this.use(obj); }, this);
    http.Server.call(this, this.handle);
};

sys.inherits(Server, http.Server);

/**
 * Use the given object as middleware.
 *
 * @param {Object} obj
 * @return {Server}
 * @api public
 */

Server.prototype.use = function(obj){
    var args = Array.prototype.slice.call(arguments, 1);

    if (!(obj.provider || obj.filter || obj.module || obj.handle)) {
        throw new Error("Must provide either 'provider', 'filter', 'module', or 'handle' in layer config");
    }
    
    if (obj.handle) {
        obj = { module: obj };
    }

    if (obj.provider) {
        obj.module = require('./providers/' + obj.provider);
        obj.name = obj.provider;
    } else if (obj.filter) {
        obj.module = require('./filters/' + obj.filter);
        obj.name = obj.filter;
    }

    if (obj.module.name) {
        obj.name = obj.module.name;
    }

    if (obj.module instanceof Server) {
        obj.handle = obj.module.handle;
    }
    
    var layer = new Layer(obj);
    layer.env = this.env;

    if (layer.setup) {
        args.unshift(layer.env);
        layer.setup.apply(layer, args);
    }

    this.stack.push(layer);
    return this;
};


/**
 * Listen on the given port number,
 * defaults to the current environment's port,
 * or 3000 when neither are present.
 *
 * @param  {Number} port
 * @return {Server}
 * @api public
 */

Server.prototype.listen = function(port) {
    http.Server.prototype.listen.call(this, port || this.env.port || 3000);
    return this;
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @api private
 */

Server.prototype.handle = function(req, res, outerNext) {
    var pathname = Url.parse(req.url).pathname + '/',
        env = this.env,
        stack = this.stack,
        index = 0;

    function next(err) {
        var layer = stack[index++];
        
        // If we reached the end of the chain...
        if (!layer) {
            // ... and we're part of a bigger chain then forward to it.
            if (outerNext) {
                outerNext();
                return;
            }

            // Otherwise send a proper error message to the browser.
            if (err) {
                res.simpleBody(500, env.name !== 'production'
                    ? err.stack || err.toString()
                    : 'Internal Server Error');
            } else {
                res.simpleBody(404, 'Cannot find ' + req.url);
            }
            return;
        }

        // Skip this layer if the route doesn't match.
        if (pathname.indexOf(layer.route) !== 0) {
            next();
            return;
        }

        // Call the layer handler
        try {
            // Trim off the part of the url that matches the route
            req.url = req.url.substr(layer.route.length - 1) || '/';
            
            if (err) {
                if (layer.handleError) {
                    layer.handleError(err, req, res, next);
                } else {
                    next(err);
                }
            } else {
                layer.handle(req, res, next);
            }
        } catch (e) {
            if (e instanceof assert.AssertionError) {
                throw e;
            } else {
                next(e);
            }
        }
    }
    next();
};

/**
 * Shortcut for new connect.Server().
 *
 * @param  {Array} middleware
 * @param  {Object} env
 * @return {Server}
 * @api public
 */

exports.createServer = function(middleware, env){
    return new Server(middleware, env);
};