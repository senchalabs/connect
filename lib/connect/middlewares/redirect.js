
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var connect = require('./../index'),
    sys = require('sys');

/**
 * Provide IncomingMessage#redirect().
 */
module.exports = function setup() {
    
    return function handle(req, res, next) {
        // Map "magic" urls
        var map = {
            back: req.headers.referrer || req.headers.referer
        };

        /**
         * Redirect to the given url, with optional
         * HTTP status code defaulting to 302.
         *
         * The following "magic" urls are automatically
         * resolved:
         *
         *   - "back"   Maps to the Referrer
         *
         * @param {String} url
         * @param {Number} code
         * @api public
         */
        res.redirect = function(url, code){
            this.writeHead(code || 302, {
                'Location': map[url] || url
            });
            this.end();
        };

        next();
    };
};
