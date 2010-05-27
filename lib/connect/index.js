
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 */

/**
 * Framework version.
 */

require('./proto');
var Connect = module.exports = exports;

Connect.version = '0.0.1';

/**
 * Module dependencies.
 */

var sys = require('sys'),
    url = require('url'),
    path = require('path'),
    http = require('http');

// chdir to CONNECT_CWD when present

if (process.env.CONNECT_CWD) {
    process.chdir(process.env.CONNECT_CWD);
}

// Runtime environment

var envName = process.env.CONNECT_ENV || 'development';

// Path to configuration module

var configPath = path.join(process.cwd(), 'config', envName);

/**
 * Connect environment configuration.
 */

var env = exports.env = require(configPath);

// Defaults

env.name = envName;
env.port = env.port || process.env.CONNECT_SOCKET;

var stack = exports.stack;

var Layer = function Layer(config) {
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
    route: '/',
    handle: function handle(req, res, next) {
        sys.debug("Warning: " + this.name + " middleware is missing handle");
        next(req, res);
    },
    name: "unnamed"
};

Connect.run = function run(configs, port) {
    configs.push({provider: "404"});

    stack = [];
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

    var server = http.createServer(handleRequest);
    server.listen(server.port = port || env.port);
    sys.debug("Starting http app on " + JSON.stringify(server.port));
    return server;
}

function handleRequest(req, res) {
    req.url = url.parse(req.url);
    res.error = function(err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(err.stack);
    }
    var pathname = req.url.pathname,
        index = 0,
        scope = {};
    (function next(req, res) {
        var layer = stack[index++];
        if (pathname.indexOf(layer.route) === 0) {
            return layer.handle(req, res, next, scope);
        }
        next(res, req);
    }(req, res));
}
