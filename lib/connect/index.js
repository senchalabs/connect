
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Framework version.
 */

exports.version = '0.0.1';

require('./proto');

/**
 * Module dependencies.
 */

var sys = require('sys'),
    http = require('http'),
    Url = require('url'),
    Path = require('path'),
    assert = require('assert');
// Response extensions

require('./response');

/**
 * Initialize a middleware Layer with the given
 * configuration object supporting the following keys:
 *
 *   - provider   name of provider middleware packaged with Connect
 *   - filter     name of filter middleware packaged with Connect
 *   - module     object responding to the "handle" method to provide your own middleware
 *   - param      single argument passed to the "setup" method when present
 *   - params     array of arguments passed to the "setup" method when present
 *
 * @param  {Object} config
 * @api private
 */

function Layer(config, env) {
    if (!(config.provider || config.filter || config.module)) {
        throw new Error("Must provide either 'provider', 'filter', or 'module' in layer config");
    }

    if (config.provider) {
        config.module = require('./providers/' + config.provider);
        this.name = config.provider;
    }
    else if (config.filter) {
        config.module = require('./filters/' + config.filter);
        this.name = config.filter;
    }

    if (config.module.name) {
        this.name = config.module.name;
    }

    if (config.param) {
        config.params = [config.param];
    }

    if (config.module instanceof Server) {
        this.handle = config.module.handle;
    }

    this.mixin(config);
    this.mixin(config.module);

    this.route = config.route || this.route;

    // Routes must always end in a slash, let's do it for the user.
    if (this.route[this.route.length - 1] !== '/') {
        this.route = this.route + "/";
    }

    this.config = config;

    config.params = config.params || [];
    config.params.unshift(env);

    if (this.setup) {
        this.setup.apply(this, config.params);
    }
};

Layer.prototype = {
    name: 'unnamed',
    route: '/',

    /**
     * Default layer handle; warns about missing handle method,
     * and proceeds down the stack.
     */

    handle: function handle(err, req, res, next) {
        sys.debug("Warning: " + this.name + " middleware is missing handle");
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
    // Custom env
    this.env = env || this.env || {};

    // Stack-up the config.
    var me = this,
        stack = this.stack = [];

    configs.forEach(function(config) {
        stack.push(new Layer(config, me.env));
    });

    // Call the parent constructor.
    http.Server.call(this, this.handle);
};

sys.inherits(Server, http.Server);

/**
 * Listen on the given port number,
 * defaults to the current environment's port,
 * or 3000 when neither are present.
 *
 * @param  {Number} port
 * @return {Server}
 * @api public
 */

Server.prototype.listen = function listen(port) {
    http.Server.prototype.listen.call(this, port || this.port || 3000);
    return this;
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @api private
 */

Server.prototype.handle = function handle(err, req, res, outerNext) {
    if (arguments.length < 4) {
        res = req;
        req = err;
        err = null;
    }

    var originalUrl = req.url,
        pathname = Url.parse(originalUrl).pathname + '/',
        env = this.env || {},
        stack = this.stack,
        index = 0;

    function next(error, request, response) {
        var layer = stack[index++];

        // The arguments to next are optional, fall back to last value.
        if (error === undefined) {
            error = err;
        } else {
            err = error;
        }
        if (request === undefined) {
            request = req;
        } else {
            req = request;
        }
        if (response === undefined) {
            response = res;
        } else {
            res = response;
        }

        // If we reached the end of the chain...
        if (!layer) {
            // ... and we're part of a bigger chain then forward to it.
            if (outerNext) {
                outerNext(error, request, response);
                return;
            }

            // Otherwise send a proper error message to the browser.
            if (error) {
                response.simpleBody(500, env.name === 'development'
                    ? error.stack || error.toString()
                    : 'Internal Server Error');
            } else {
                response.simpleBody(404, 'Cannot find ' + req.url);
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
            req.url = originalUrl.substr(layer.route.length - 1) || '/';
            layer.handle(error, request, response, next);
        } catch (e) {
            if (e instanceof assert.AssertionError) {
                throw e;
            } else {
                next(err = e);
            }
        }
    }
    next(null, req, res);
};

/**
 * Shortcut for new connect.Server().
 *
 * @param  {Array} middleware
 * @param  {Object} env
 * @return {Server}
 * @api public
 */

exports.createServer = function createServer(middleware, env){
    return new Server(middleware, env);
};