
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

/**
 * Framework version.
 */

exports.version = '0.0.1'

/**
 * Module dependencies.
 */

var sys = require('sys'),
    url = require('url'),
    path = require('path'),
    http = require('http')

// chdir to CONNECT_CWD when present

if (process.env.CONNECT_CWD) {
    process.chdir(process.env.CONNECT_CWD)
}

// Runtime environment

var envName = process.env.CONNECT_ENV || 'development'

// Path to configuration module

var configPath = path.join(process.cwd(), 'config', envName)

/**
 * Connect environment configuration.
 */

var env = exports.env = require(configPath)
env.name = envName

// Defaults

env.name = envName
env.port = env.port || process.env.CONNECT_SOCKET

var stack = exports.stack

exports.run = function run(configs) {
    configs.push(['', 'connect/providers/404'])
    
    stack = []
    configs.forEach(function(config) {
        var mod = config[1]

        if (typeof mod === 'string') {
            mod = require(mod)
        }
        
        if (!mod.handle) {
            sys.debug("Warning, invalid middleware step: " + JSON.stringify(config))
            return;
        }
        
        if (mod.setup) {
            mod.setup.apply(mod, [env].concat(config.slice(2)))
        }

        var routes = config[0]
        if (!Array.isArray(routes)) {
            routes = [routes];
        }
        
        for (var i = 0, len = routes.length; i < len; ++i) {
            stack.push({
                route: routes[i],
                handler: mod.handler
            })
        }
    })
    
    var server = http.createServer(handleRequest)
    server.listen(env.port)
    return server
}

function handleRequest(request, response) {
    request.url = url.parse(request.url);
    response.error = function (err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.end(err.stack);
    }
    var pathname = request.url.pathname;
    var index = 0;
    var scope = {};
    (function getNext(request, response) {
        var middleware = stack[index];
        index++;
        if (pathname.indexOf(middleware.route) === 0) {
            return middleware.handler(request, response, getNext, scope);
        }
        getNext(request, response);
    }(request, response));
}
