
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Framework version.
 */

exports.version = '0.0.1';

/**
 * Module dependencies.
 */

var sys = require('sys'),
    url = require('url'),
    path = require('path'),
    http = require('http');

// Response extensions

require('./response')

// chdir to CONNECT_CWD when present

if (process.env.CONNECT_CWD) {
    process.chdir(process.env.CONNECT_CWD);
}

// Runtime environment

var envName = process.env.CONNECT_ENV || 'development';

// Path to configuration module

var configPath = path.join(process.cwd(), 'config', envName);

// Connect environment configuration.

var env = exports.env = require(configPath);
env.name = envName;

// Defaults

env.name = envName;
env.port = env.port || process.env.CONNECT_SOCKET;

/**
 * Run the given middleware configurations.
 *
 * The first value in each configuration array
 * may be an string or array of paths to match,
 * followed by the module object or name. All additional
 * arguments are passed to the optional setup function.
 *
 *   connect.run(
 *      ['/', 'connect/filters/log'],
 *      ['/', 'connect/providers/static', __dirname + '/public']
 *   )
 *
 * @param  {Array} middleware
 * @return {Server}
 * @api public
 */

exports.run = function run(middleware, port) {
    var stack = [];
    middleware.push(['', 'connect/providers/404']);
    middleware.forEach(function(config) {
        var mod = config[1];

        if (typeof mod === 'string') {
            mod = require(mod);
        }
        
        if (!mod.handle) {
            sys.debug('Warning, invalid middleware step: ' + JSON.stringify(config));
            return;
        }
        
        if (mod.setup) {
            mod.setup.apply(mod, [env].concat(config.slice(2)));
        }

        var routes = config[0];
        if (!Array.isArray(routes)) {
            routes = [routes];
        }
        
        routes.forEach(function(route){
            stack.push({
                route: route,
                handle: mod.handle
            });
        })
    })
    
    var server = http.createServer(function(req, res){
        req.url = url.parse(req.url);
        var pathname = req.url.pathname,
            index = 0,
            scope = {};
        (function next(req, res) {
            var middleware = stack[index++];
            if (pathname.indexOf(middleware.route) === 0) {
                middleware.handle(req, res, next, scope);
            } else {
                next(res, req);
            }
        }(req, res));
    });
    server.listen(server.port = port || env.port);
    server.stack = stack;
    return server;
}
