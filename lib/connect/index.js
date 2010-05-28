
/*!
 * Ext JS Connect 0.0.1
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
    url = require('url'),
    path = require('path'),
    http = require('http');

// Response extensions

require('./response');

// chdir to CONNECT_CWD when present

if (process.env.CONNECT_CWD) {
    process.chdir(process.env.CONNECT_CWD);
}

// Runtime environment

var envName = process.env.CONNECT_ENV || 'development';

// Path to configuration module

var configPath = path.join(process.cwd(), 'config', envName);

// Connect environment configuration.

var env;
try {
    env = exports.env = require(configPath);
} catch (err) {
    env = exports.env = {};
}

// Defaults

env.name = envName;
env.port = env.port || process.env.CONNECT_SOCKET || 3000;

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

function Layer(config) {
    if (!(config.provider || config.filter || config.module)) {
        throw new Error("Must provide either 'provider', 'filter', or 'module' in layer config");
    }

    if (config.provider) {
        config.module = require("./providers/" + config.provider);
        this.name = config.provider;
    }
    else if (config.filter) {
        config.module = require("./filters/" + config.filter);
        this.name = config.filter;
    }

    if (config.module.name) {
        this.name = config.module.name;
    }

    if (config.param) {
        config.params = [config.param];
    }

    this.mixin(config.module);

    this.route = config.route || this.route;
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

    handle: function handle(req, res, next) {
        sys.debug("Warning: " + this.name + " middleware is missing handle");
        next(req, res);
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
 * @return {Server}
 * @api public
 */

function Server(configs) {
    var stack = this.stack = [];
    configs.forEach(function(config) {
        if (config.route instanceof Array) {
            config.route.forEach(function (route) {
                config.route = route;
                stack.push(new Layer(config));
            });
            return;
        }
        stack.push(new Layer(config));
    });

    // Call the parent constructor
    http.Server.call(this, this.handle);
}

sys.inherits(Server, http.Server);

/**
 * Listen on the given port number,
 * defaults to the current environment's port.
 *
 * @param  {Number} port
 * @return {Server}
 * @api public
 */

Server.prototype.listen = function listen(port) {
    this.port = port || env.port;
    sys.puts("Connect server listening on port " + this.port);
    http.Server.prototype.listen.call(this, this.port);
    return this;
};

/**
 * Handle server requests, punting them down
 * the middleware stack.
 *
 * @param  {ServerRequest} req
 * @param  {ServerResponse} res
 * @api private
 */

Server.prototype.handle = function handle(req, res, outerNext) {
    req.url = url.parse(req.url);

    var pathname = req.url.pathname,
        stack = this.stack,
        index = 0;

    function next(err, req, res) {
        var layer = stack[index++];
        if (layer && pathname.indexOf(layer.route) === 0) {
            layer.handle(err, req, res, next);
        } else if (outerNext) {
            outerNext(err, req, res);
        } else {
            res.simpleBody(404, 'Cannot find ' + pathname);
            next(err, req, res);
        }
    }
    next(null, req, res);
};

/**
 * Shortcut for new connect.Server().
 *
 * @param  {Array} middleware
 * @return {Server}
 * @api public
 */

exports.createServer = function createServer(middleware){
    return new Server(middleware);
};

exports.Server = Server;