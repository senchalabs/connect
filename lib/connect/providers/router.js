/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

// This provider is the core functionality of node-router put in a middleware

var sys = require('sys'),
    Buffer = require('buffer').Buffer;

var routes = [];

function addRoute(method) {
    return function (pattern, handler, format) {
        if (typeof pattern === 'string') {
            pattern = new RegExp("^" + pattern + "$");
        }
        var route = {
            method: method,
            pattern: pattern,
            handler: handler
        };
        if (format !== undefined) {
            route.format = format;
        }
        routes.push(route);
    };
}

function handleRoute(req, res, route, match) {

    match = [req, res].concat(match.slice(1));

    function dispatch() {
        var result = route.handler.apply(null, match);
        if (result) {
            res.simpleBody(200, result, "text/html");
        }
    }
    if (route.format) {
        var body = "";
        req.setEncoding('utf8');
        req.addListener('data', function (chunk) {
            body += chunk;
        });
        req.addListener('end', function () {
            if (route.format === 'json') {
                body = JSON.parse(body);
            }
            match.push(body);
            dispatch();
        });
        return;
    }
    dispatch();

}

module.exports = {
    setup: function (env, setup) {
        sys.error('Warning: the "router" middleware is deprecated. Use "rest", `$ man connect-rest` for documentation');
        setup({
            get: addRoute("GET"),
            put: addRoute("PUT"),
            del: addRoute("DELETE"),
            post: addRoute("POST")
        });
    },

    handle: function (req, res, next) {
        var origReq = req,
            origRes = res;
        req = Object.create(req);
        res = Object.create(res);

        res.notFound = function (message) {
            next(origReq, origRes);
        };

        for (var i = 0, l = routes.length; i < l; i++) {
            var route = routes[i];
            if (req.method === route.method) {
                var match = req.url.match(route.pattern);
                if (match && match[0].length > 0) {
                    handleRoute(req, res, route, match, next);
                    return;
                }
            }
        }
        next();
    }
};