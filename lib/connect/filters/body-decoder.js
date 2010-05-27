
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
 * Decode urlencoded request bodies.
 */

exports.handle = function(req, res, next){
    var contentType = req.headers['content-type'] || '';
    if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
        req.body = '';
        req.addListener('data', function(chunk){
            req.body += chunk;
        })
        req.addListener('end', function(){
            req.params = req.params || {};
            req.params.post = queryString.parseQuery(req.body);
            next(req, res);
        })
    } else {
        next(req, res);
    }
}