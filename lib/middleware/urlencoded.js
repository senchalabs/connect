
/*!
 * Connect - urlencoded
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils');
var getFormBody = require('body/form');
var bytes = require('bytes');
var qs = require('qs');


/**
 * Urlencoded:
 *
 *  Parse x-ww-form-urlencoded request bodies,
 *  providing the parsed object as `req.body`.
 *
 * Options:
 *
 *    - `limit`  byte limit [1mb]
 *   - `verify`  synchronous verification function.
 *      should have signature (req, res, buffer).
 *      should throw an error on failure.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {};

  var limit = !options.limit ? bytes('1mb')
    : typeof options.limit === 'number' ? options.limit
    : typeof options.limit === 'string' ? bytes(options.limit)
    : null

  // define our own querystring parser that uses qs and the
  // connect defaults
  var querystringParser = {
    parse: function (buf, callback) {
      buf = buf.trim();

      try {
        callback(null, buf.length
          ? qs.parse(buf, options)
          : {});
      } catch (err) {
        err.body = buf;
        callback(err);
      }
    }
  };

  return function urlencoded(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};

    if (!utils.hasBody(req)) return next();

    // check Content-Type
    if ('application/x-www-form-urlencoded' != utils.mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse
    getFormBody(req, {
      limit: limit,
      querystring: querystringParser
    }, function (err, body) {
      if (err) return next(err);

      req.body = body;
      next();
    });
  }
};
