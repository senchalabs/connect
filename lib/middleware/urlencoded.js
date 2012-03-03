
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
 * Urlencoded:
 * 
 *  Parse x-ww-form-urlencoded request bodies,
 *  providing the parsed object as `req.body`.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {};

  if (typeof options.skip_methods === "undefined") {
    options.skip_methods = ["GET", "HEAD"];
  }

  return function urlencoded(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};

    // ignore appropriate methods
    if (options.skip_methods) {
      for (var i in options.skip_methods) {
        if (options.skip_methods[i] == req.method) {
          return next();
        }
      }
    }

    // check Content-Type
    if ('application/x-www-form-urlencoded' != utils.mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
      try {
        req.body = buf.length
          ? qs.parse(buf, options)
          : {};
        next();
      } catch (err){
        next(err);
      }
    });
  }
};
