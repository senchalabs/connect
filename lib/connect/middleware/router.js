
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse,
    querystring = require('querystring');

/**
 * Provides Sinatra and Express like routing capabilities.
 *
 * Examples:
 *
 *     connect.router(function(app){
 *         app.get('/user/:id', function(req, res, next){
 *             // populates req.params.id
 *         });
 *     })
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

module.exports = function router(fn){
    var routes;

    if (fn) {
        routes = {};
        var methods = {
            post: method.call(this, 'post'),
            get: method.call(this, 'get'),
            put: method.call(this, 'put'),
            delete: method.call(this, 'delete')
        };
        methods.del = methods.delete;
        fn.call(this, methods);
    } else {
        throw new Error('router provider requires a callback function');
    }

    function method(name) {
        var self = this,
            localRoutes = routes[name] = routes[name] || [];
        return function(path, fn){
            var keys = [];
            path = path instanceof RegExp
                ? path
                : normalizePath(path, keys);
            localRoutes.push({
                fn: fn,
                path: path,
                keys: keys
            });
            return self;
        };
    }

    return function router(req, res, next){
        var route,
            self = this;
        (function pass(i){
            if (route = match(req, routes, i)) {
                req.params = req.params || route._params;
                try { 
                    route.call(self, req, res, function(err){
                        if (err === true) {
                            next();
                        } else if (err) {
                            next(err);
                        } else {
                            pass(route._index+1);
                        }
                    });
                } catch (err) {
                    next(err);
                }
            } else {
                next();
            }
        })();
    };
}

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
                + (format || '') + '([^/.]+))'
                + (optional || '');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.+)');
    return new RegExp('^' + path + '$', 'i');
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

function match(req, routes, i) {
    var captures,
        method = req.method.toLowerCase(),
        i = i || 0;
    if ('head' == method) method = 'get';
    if (routes = routes[method]) {
        var url = parse(req.url),
            pathname = url.pathname;
        for (var len = routes.length; i < len; ++i) {
            var route = routes[i],
                fn = route.fn,
                path = route.path,
                keys = route.keys;
            if (captures = path.exec(pathname)) {
                fn._params = [];
                for (var j = 1, len = captures.length; j < len; ++j) {
                    var key = keys[j-1],
                        val = typeof captures[j] === 'string'
                            ? querystring.unescape(captures[j])
                            : captures[j];
                    if (key) {
                        fn._params[key] = val;
                    } else {
                        fn._params.push(val);
                    }
                }
                fn._index = i;
                return fn;
            }
        }
    }
}
