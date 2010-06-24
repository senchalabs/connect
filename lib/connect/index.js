
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Framework version.
 */

exports.version = '0.0.6';

/**
 * Module dependencies.
 */

var sys = require('sys'),
    http = require('http'),
    Url = require('url'),
    Path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    utils = require('./utils');

// Response extensions

require('./response');

// Extensions

// Implements a forEach much like the one for Array.prototype.forEach, but for
// any object.
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

// Implements a map much like the one for Array.prototype.map, but for any
// object. Returns an array, not a generic object.
if (typeof Object.prototype.map !== 'function') {
  Object.defineProperty(Object.prototype, "map", {value: function (callback, thisObject) {
    var accum = [];
    var keys = Object.keys(this);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      accum[i] = callback.call(thisObject, this[key], key, this);
    }
    return accum;
  }});
}



/**
 * Setup the given middleware layer callbacks.
 *
 *   new Connect.Server(
 *      Connect.filters.log(),
 *      Connect.providers.static(__dirname + "/public")
 *   )
 *
 * @params  {Array} middleware
 * @return {Server}
 * @api public
 */

var Server = exports.Server = function Server(layers) {
    this.stack = [];

    layers.forEach(function(layer){
        this.use("/", layer);
    }, this);

    // Set up the request handler using the parent's constructor
    http.Server.call(this, this.handle);
};

// Server is a subclass of http.Server
sys.inherits(Server, http.Server);

/**
 * Use the given object as middleware.
 *
 * @param {Object} obj
 * @return {Server}
 * @api public
 */

Server.prototype.use = function(route, handle){

    // Allow for more than one handle function to be added at a time
    if (arguments.length > 2) {
        Array.prototype.slice.call(arguments, 1).forEach(function (handle) {
            this.use(route, handle);
        }, this);
        return this;
    }

    // Wrap sub-apps
    if (handle instanceof Server) {
        handle = function(req, res, next) {
            handle.handle(req, res, next);
        };
    }

    // Validate the input
    if (!(typeof route === 'string' && typeof handle === 'function')) {
        throw new Error("Each layer must have a route and a handle function");
    }

    // Add the route, handle pair to the stack
    this.stack.push({route: route, handle: handle});
    
    // Allow chaining
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
                if (layer.handle.length === 4) {
                    layer.handle(err, req, res, next);
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

exports.createServer = function() {
    var middleware = Array.prototype.slice.call(arguments);
    return new Server(middleware);
};

/**
 * Auto-loading.
 */

var dir = __dirname + "/middleware";
fs.readdirSync(dir).forEach(function(filename) {
    if (/\.js$/.test(filename)) {
        var name = filename.substr(0, filename.lastIndexOf('.'));
        var path = dir + "/" + name;
        Object.defineProperty(exports, name, { get:  function(){
            return require(path);
        }});
    }
});
