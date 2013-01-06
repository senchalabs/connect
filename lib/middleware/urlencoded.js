
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
  , text = require('./text')
  , qs = require('qs');

/**
 * Urlencoded:
 *
 *  Parse x-ww-form-urlencoded request bodies,
 *  providing the parsed object as `req.body`.
 *
 * Options:
 *
 *    - `limit`  byte limit disabled by default
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {};

  return function urlencoded(req, res, next) {
    text(options)(req, res, function (error) {
      if (error) return next(error);
      if (typeof req.body == 'undefined') {
        req.body = {};
        return next();
      }
      if (typeof req.body != 'string') return next();
      // check Content-Type
      if ('application/x-www-form-urlencoded' != utils.mime(req)) return next();
      //OK to establish our defaults here
      var encoded = req.body;
      req.body = {};
      if (0 == encoded.length) return next();
      try {
        req.body = qs.parse(encoded, options);
        next();
      } catch (err){
        err.body = encoded;
        err.status = 400;
        next(err);
      }
    });
  };
};
