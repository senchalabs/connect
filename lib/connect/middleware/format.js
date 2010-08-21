
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var connect = require('./../index'),
    sys = require('sys');

/**
 * Extract url "formats" aka extensions from the request
 * url, and assigns req.`format`.
 *
 * Examples:
 *
 *      // curl http://localhost:3000/users.json
 *      handle: function(req, res, next){
 *         switch (req.format) {
 *             case 'json':
 *                 sys.puts(req.url);
 *                 // => "users"
 *                 // respond with json
 *                 break;
 *             default:
 *                 // respond with your default format
 *         }
 *      }
 *
 * @return {Function}
 * @api public
 */

module.exports = function format(){
    return function format(req, res, next) {
        if (/[^\.]\.(\w+)($|#|\?)/.exec(req.url)) {
            req.format = RegExp.$1;
            req.url = req.url.replace('.' + req.format, '');
        }
        next();
    };
};