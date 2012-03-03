
/*!
 * Connect - json
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils');

/**
 * JSON:
 *
 * Parse JSON request bodies, providing the
 * parsed object as `req.body`.
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

  return function json(req, res, next) {
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
    if ('application/json' != utils.mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
      if ('{' != buf[0] && '[' != buf[0]) return next(utils.error(400));
      try {
        req.body = JSON.parse(buf);
        next();
      } catch (err){
        err.status = 400;
        next(err);
      }
    });
  }
};
