
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
var getJsonBody = require('body/json');
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
  var strict = options.strict !== false;

  var limit = !options.limit ? bytes('1mb')
    : typeof options.limit === 'number' ? options.limit
    : typeof options.limit === 'string' ? bytes(options.limit)
    : null;

  // supply a custom JSON parser to getJsonBody. This contains
  // the connect specific parsing of json including strict handling
  var JSONParser = {
    parse: function (buf, reviver, cb) {
      buf = buf.trim();

      var first = buf[0];

      if (0 == buf.length) {
        return cb(utils.error(400, 'invalid json, empty body'));
      }

      if (strict && '{' != first && '[' != first) {
        return cb(utils.error(400, 'invalid json'));
      }
      try {
        cb(null, JSON.parse(buf, reviver));
      } catch (err){
        err.body = buf;
        err.status = 400;
        return cb(err);
      }
    }
  };

  return function json(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};

    if (!utils.hasBody(req)) return next();

    // check Content-Type
    if (!exports.regexp.test(utils.mime(req))) return next();

    // flag as parsed
    req._body = true;

    // parse
    getJsonBody(req, {
      limit: limit,
      reviver: options.reviver,
      JSON: JSONParser
    }, function (err, body) {
      if (err) return next(err);

      req.body = body;
      next();
    });
  };
};

exports.regexp = /^application\/([\w!#\$%&\*`\-\.\^~]*\+)?json$/i;

