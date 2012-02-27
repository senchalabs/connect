
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
  return function json(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};

    // ignore GET
    if ('GET' == req.method || 'HEAD' == req.method) return next();

    // check Content-Type
    if ('application/json' != utils.mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
      if (!buf.length) {
        // 0-length body
        req.body = {};
      } else {
        // JSON-text compliance: http://tools.ietf.org/html/rfc4627#section-2
        var beginChar = buf[0];
        if (beginChar != '{' && beginChar != '[') return next(utils.error(400));
        try {
          req.body = JSON.parse(buf);
        } catch (err){
          err.status = 400;
          return next(err);
        }
      }
      next();
    });
  }
};