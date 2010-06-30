
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
 * Provide `res.redirect()`.
 *
 * Examples:
 *
 *     // Absolute
 *     res.redirect('http://google.com');
 *
 *     // Relative + custom status
 *     res.redirect('/foo', 301);
 *
 *     // Referr?er
 *     res.redirect('back');
 *
 * @return {Function}
 * @api public
 */

module.exports = function redirect(){
    return function redirect(req, res, next) {
        var map = {
            back: req.headers.referrer || req.headers.referer || '/'
        };

        res.redirect = function(url, code){
            this.writeHead(code || 302, {
                'Location': map[url] || url
            });
            this.end();
        };

        next();
    };
};
