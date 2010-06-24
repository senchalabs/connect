
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../utils');

/**
 * Parse Cookie header and populate req.cookies.
 */

module.exports = function(){
    return function handle(req, res, next) {
        var cookie = req.headers.cookie;
        req.cookies = {};
        if (cookie) {
            process.nextTick(function(){
                try {
                    req.cookies = utils.parseCookie(cookie);
                    delete req.headers.cookie;
                } catch (err) {
                    // Ignore
                }
                next();
            });
        } else {
            next();
        }
    };
};