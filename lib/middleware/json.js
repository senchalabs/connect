
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
var getBody = require('raw-body');
var bytes = require('bytes');

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
 *   - `limit`  byte limit [1mb]
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  var options = options || {}
    , strict = options.strict !== false;

  var limit = !options.limit ? bytes('1mb')
    : typeof options.limit === 'number' ? options.limit
    : typeof options.limit === 'string' ? bytes(options.limit)
    : null

  return function json(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};

    if (!utils.hasBody(req)) return next();

    // check Content-Type
    if (!exports.regexp.test(utils.mime(req))) return next();

    // flag as parsed
    req._body = true;

    // parse
    getBody(req, {
      limit: limit,
      expected: req.headers['content-length']
    }, function (err, buf) {
      if (err) return next(err);

      buf = buf.toString('utf8').trim();

      var first = buf[0];

      if (0 == buf.length) {
        return next(utils.error(400, 'invalid json, empty body'));
      }

      if (strict && '{' != first && '[' != first) return next(utils.error(400, 'invalid json'));
      try {
        req.body = JSON.parse(buf, options.reviver);
      } catch (err){
        err.body = buf;
        err.status = 400;
        return next(err);
      }
      next();
    })
  };
};

exports.regexp = /^application\/([\w!#\$%&\*`\-\.\^~]*\+)?json$/i;

