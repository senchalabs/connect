
/*!
 * Ext JS Connect 0.0.1
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

var methods = ['GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS']

/**
 * Pass an optional key to use when checking for
 * a method override, othewise defaults to '_method'.
 */

exports.setup = function(env, key){
    this.key = key || '_method';
}

/**
 * Supports overriding of the http request method,
 * to aid in RESTful support.
 */

exports.handle = function(err, req, res, next){
    if (typeof req.body === 'object' && this.key in req.body) {
        var method = req.body[this.key].toUpperCase();
        if (methods.indexOf(method) !== -1) {
            req.method = method;
        }
    }
    next();
}