
/*!
 * Connect - text
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , _limit = require('./limit');

var DEFAULT_MIME_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded'
];

/**
 * noop middleware.
 */

function noop(req, res, next) {
  next();
}

function relevantMIMEType(req, mimeTypes) {
  var mime = utils.mime(req);
  return (mimeTypes.indexOf(mime) >= 0) ||
    (0 == mime.indexOf('text/'));
}
/**
 * text:
 *
 *  Assemble text request bodies,
 *  providing the combined String object as `req.body`.
 *
 *  By default requests with any `text/*` MIME type as well as
 *  `application/json` and `application/x-www-form-urlencoded`
 *  will be assembled into `req.body`.
 *
 * Options:
 *
 *    - `limit`  byte limit disabled by default
 *    - `mimeTypes` list of MIME strings to treat as text
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {mimeTypes: DEFAULT_MIME_TYPES};

  options.mimeTypes = options.mimeTypes || DEFAULT_MIME_TYPES;
  var limit = options.limit
    ? _limit(options.limit)
    : noop;

  return function text(req, res, next) {
    if (req._body) return next();
    if (!utils.hasBody(req)) return next();
    if (!relevantMIMEType(req, options.mimeTypes)) return next();

    limit(req, res, function(err){
      if (err) return next(err);
      req.body = req.body || '';
      //mark as assembled/buffered
      req._body = true;
      var buf = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){ buf += chunk });
      req.on('end', function(){
        req.body = buf;
        next();
      });
    });
  }
};
