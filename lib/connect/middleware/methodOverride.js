/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var queryString = require('querystring');

/**
 * Valid http methods.
 */

var methods = ['GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS'];

/**
 * Pass an optional key to use when checking for
 * a method override, othewise defaults to '_method'.
 */
module.exports = function setup(key) {
    key = key || "_method";

    /**
     * Supports overriding of the http request method,
     * to aid in RESTful support.
     */
    return function handle(req, res, next) {
        if (typeof req.body === 'object' && key in req.body) {
            var method = req.body[key].toUpperCase();
            if (methods.indexOf(method) >= 0) {
                req.method = method;
                delete req.body[key];
            }
        }
        next();
    };
};

