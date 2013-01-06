
/*!
 * Connect - json
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , text = require('./text');


/**
 * JSON:
 *
 * Parse JSON request bodies, providing the
 * parsed object as `req.body`.
 *
 * Options:
 *
 *   - `strict`  when `false` anything `JSON.parse()` accepts will be parsed
 *   - `reviver`  used as the second "reviver" argument for JSON.parse
 *   - `limit`  byte limit disabled by default
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  var options = options || {}
    , strict = options.strict !== false;

  return function json(req, res, next) {
    text(options)(req, res, function (error) {
      if (error) return next(error);
      if (typeof req.body == 'undefined') {
        req.body = {};
        return next();
      }
      if (typeof req.body != 'string') return next();
      // check Content-Type
      if ('application/json' != utils.mime(req)) return next();
      //OK to establish our defaults here
      var json = req.body;
      req.body = {};
      if (0 == json.length) {
        return next(400, 'invalid json, empty body');
      }
      var first = json.trim()[0];
      if (strict && '{' != first && '[' != first) return next(400, 'invalid json');
      try {
        req.body = JSON.parse(json, options.reviver);
        next();
      } catch (err){
        err.body = json;
        err.status = 400;
        next(err);
      }
    });
  };
};
