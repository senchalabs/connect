
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var queryString = require('querystring');

/**
 * Valid http methods.
 *
 * @type Array
 */

var methods = ['GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS'];

/**
 * Pass an optional `key` to use when checking for
 * a method override, othewise defaults to __method_.
 *
 * @param {String} key
 * @return {Function}
 * @api public
 */

module.exports = function methodOverride(key){
    key = key || "_method";
    return function methodOverride(req, res, next) {
        var method = req.method;

        // Check req.body (bodyDecoder)
        if (typeof req.body === 'object' && key in req.body) {
            method = req.body[key];
            delete req.body[key];
        // Check X-HTTP-Method-Override
        } else if (req.headers['x-http-method-override']) {
            method = req.headers['x-http-method-override'];
        }

        // Ensure method is valid, and normalize
        method = method.toUpperCase();
        if (methods.indexOf(method) >= 0) {
            req.method = method;
        }
        
        next();
    };
};

