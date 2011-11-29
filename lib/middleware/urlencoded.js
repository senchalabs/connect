
/*!
 * Connect - urlencoded
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , qs = require('qs');

/**
 * Parse JSON request bodies, providing the
 * parsed object as `req.body`.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {};
  return function urlencoded(req, res, next) {
    if (req.body) return next();
    req.body = {};

    // ignore GET
    if ('GET' == req.method || 'HEAD' == req.method) return next();

    // check Content-Type
    if ('application/x-www-form-urlencoded' != utils.mime(req)) return next();

    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
      try {
        req.body = qs.parse(buf);
        fn();
      } catch (err){
        fn(err);
      }
    });
  }
};