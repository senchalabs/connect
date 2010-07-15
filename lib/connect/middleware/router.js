
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse;

/**
 * Provides Sinatra and Express like routing capabilities.
 *
 * Examples:
 *
 *     connect.router(function(app){
 *         app.get('/user/:id', function(req, res, params){
 *             // populates params.id
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
        fn.call(this, {
            post: method.call(this, 'post'),
            get: method.call(this, 'get'),
            put: method.call(this, 'put'),
            del: method.call(this, 'del')
        });
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
            localRoutes.push(fn, path, keys);
            return self;
        };
    }

    return function router(req, res, next){
        var route,
            self = this;
        (function pass(i){
            if (route = match(req, routes, i)) {
                req.params = req.params || {};
                req.params.path = route._params;
                try { 
                    route.call(self, req, res, route._params, function(err){
                        if (err) {
                            next(err);
                        } else {
                            pass(++route._index);
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
                + (format || '') + '([^/]+))'
                + (optional || '');
        })
        .replace(/([\/.-])/g, '\\$1')
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
    if (method === 'delete') {
        method = 'del';
    }
    if (routes = routes[method]) {
        var url = parse(req.url),
            pathname = url.pathname;
        for (var len = routes.length; i < len; ++i) {
            var fn = routes[i++],
                path = routes[i++],
                keys = routes[i];
            if (captures = path.exec(pathname)) {
                fn._params = { splat: [] };
                for (var j = 1, len = captures.length; j < len; ++j) {
                    var key = keys[j-1];
                    if (key) {
                        fn._params[keys[j-1]] = captures[j];
                    } else {
                        fn._params.splat.push(captures[j]);
                    }
                }
                fn._index = i;
                return fn;
            }
        }
    }
}