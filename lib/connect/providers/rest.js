
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse;

/**
 * Setup routes.
 */

exports.setup = function(){
    if (this.routes) {
        normalize(this.routes);
    } else {
        throw new Error('rest provider requires a "routes" object');
    }
};

/**
 * Attempt to match and call a route.
 */

exports.handle = function(err, req, res, next){
    var self = this;
    process.nextTick(function(){
        var route;
        if (route = match(req, self.routes)) {
            route.call(self, req, res, route._params);
        } else {
            next();
        }
    });
};

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String} path
 * @param  {Array} keys
 * @return {RegExp}
 * @api private
 */

function normalizePath(path, keys) {
    path = path
        .concat('/?')
        .replace(/(\/)/g, '\\$1')
        .replace(/:(\w+)/g, function(_, key){
            keys.push(key);
            return '([^/]+)';
        });
    return new RegExp('^' + path + '$', 'i');
};

/**
 * Normalize the given routes object
 * into methods with arrays of regular expressions.
 *
 * @param  {Object} routes
 * @api private
 */

function normalize(routes) {
    for (var method in routes) {
        var arr = [];
        for (var path in routes[method]) {
            var keys = [];
            arr.push(routes[method][path], normalizePath(path, keys), keys);
        }
        routes[method] = arr;
    }
};

/**
 * Attempt to match the given request to
 * one of the routes. When successful
 * a route function is returned.
 *
 * @param  {ServerRequest} req
 * @param  {Object} routes
 * @return {Function}
 * @api private
 */

function match(req, routes) {
    var captures,
        method = req.method.toLowerCase();
    if (routes = routes[method]) {
        var url = parse(req.url),
            pathname = url.pathname;
        for (var i = 0, len = routes.length; i < len; ++i) {
            var fn = routes[i++],
                path = routes[i++],
                keys = routes[i];
            if (captures = path.exec(pathname)) {
                fn._params = {};
                for (var i = 1, len = captures.length; i < len; ++i) {
                    fn._params[keys[i-1]] = captures[i];
                }
                return fn;
            }
        }
    }
};