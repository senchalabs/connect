
/*!
 * Connect - bodyParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var qs = require('qs');

/**
 * Extract the mime type from the given request's
 * _Content-Type_ header.
 *
 * @param  {IncomingMessage} req
 * @return {String}
 * @api private
 */

function mime(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
}

/**
 * Decode request bodies.
 *
 * @return {Function}
 * @api public
 */

exports = module.exports = function bodyParser(){
  return function bodyParser(req, res, next) {
    var parser = exports.parse[mime(req)];
    if (parser && !req.body) {
      var data = '';
      req.setEncoding('utf8');
      req.addListener('data', function(chunk) { data += chunk; });
      req.addListener('end', function() {
        req.rawBody = data;
        try {
          req.body = data
            ? parser(data)
            : {};
        } catch (err) {
          return next(err);
        }
        next();
      });
    } else {
      next();
    }
  }
};

/**
 * Supported decoders.
 *
 *  - application/x-www-form-urlencoded
 *  - application/json
 */

exports.parse = {
    'application/x-www-form-urlencoded': qs.parse
  , 'application/json': JSON.parse
};