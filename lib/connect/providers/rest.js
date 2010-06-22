
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

exports.setup = function(env, fn){
    fn = this.app || fn;
    if (fn) {
        this.routes = {};
        fn.call(this, {
            post: method.call(this, 'post'),
            get: method.call(this, 'get'),
            put: method.call(this, 'put'),
            del: method.call(this, 'del')
        });
    } else {
        throw new Error('rest provider requires a callback function');
    }
};

/**
 * Attempt to match and call a route.
 */

exports.handle = function(req, res, next){
    var self = this;
    process.nextTick(function(){
        var route;
        if (route = match(req, self.routes)) {
            req.params = req.params || {};
            req.params.path = route._params;
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
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(\?)?/g, function(_, slash, format, key, optional){
            keys.push(key);
            slash = slash || '';
            return ''
                + (optional ? '' : slash) 
                + '(?:' 
                + (optional ? slash : '')
                + (format || '') + '([^/]+))' 
                + (optional || '');
        })
        .replace(/([\/.-])/g, '\\$1')
        .replace(/\*/g, '(.+)');
    return new RegExp('^' + path + '$', 'i');
}

/**
 * Return a RESTful function.
 *
 * @param {String} name
 * @return {Function}
 * @api private
 */

function method(name) {
    var self = this,
        routes = this.routes[name] = this.routes[name] || [];
    return function(path, fn){
        var keys = [];
        path = path instanceof RegExp
            ? path
            : normalizePath(path, keys);
        routes.push(fn, path, keys);
        return self;
    }
}

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
    if (method === 'delete') {
        method = 'del';
    }
    if (routes = routes[method]) {
        var url = parse(req.url),
            pathname = url.pathname;
        for (var i = 0, len = routes.length; i < len; ++i) {
            var fn = routes[i++],
                path = routes[i++],
                keys = routes[i];
            if (captures = path.exec(pathname)) {
                fn._params = { splat: [] };
                for (var i = 1, len = captures.length; i < len; ++i) {
                    var key = keys[i-1];
                    if (key) {
                        fn._params[keys[i-1]] = captures[i];
                    } else {
                        fn._params.splat.push(captures[i]);
                    }
                }
                return fn;
            }
        }
    }
}