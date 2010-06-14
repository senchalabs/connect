
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
 * Extract url "formats" aka extensions from the request
 * url, and assigns req.format.
 *
 * Example:
 * 
 *   // curl http://localhost:3000/users.json
 *   handle: function(req, res, next){
 *      switch (req.format) {
 *          case 'json':
 *              // respond with json
 *              break;
 *          default:
 *              // respond with your default format
 *      }
 *   }
 * 
 */

exports.handle = function(req, res, next){
    if (/\.(\w+)($|#|\?)/.exec(req.url)) {
        req.format = RegExp.$1;
        req.url = req.url.replace('.' + req.format, '');
    }
    next();
};