
/*!
 * Connect - compress
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var zlib = require('zlib');

/**
 * Supported content-encoding methods.
 */

exports.methods = {
    gzip: zlib.createGzip
  , deflate: zlib.createDeflate
};

/**
 * Default filter function.
 */

exports.filter = function(req, res){
  var type = res.getHeader('Content-Type') || '';
  return type.match(/json|text/);
};

/**
 * Compress response data with gzip/deflate.
 *
 * Filter:
 *
 * A `filter` callback function may be passed to
 * replace the default logic of compressing "text/?"
 * and "?/json". Here's the default:
 *
 *     exports.filter = function(req, res){
 *       var type = res.getHeader('Content-Type') || '';
 *       return type.match(/json|text/);
 *     };
 *
 * Options:
 *
 *  All remaining options are passed to the gzip/deflate
 *  creation functions. Consult node's docs for additional details.
 *
 *     - `chunkSize` (default: 16*1024)
 *     - `windowBits`
 *     - `level`: 0-9 where 0 is no compression, and 9 is slow but best compression
 *     - `memLevel`: 1-9 low is slower but uses less memory, high is fast but uses more
 *     - `strategy`: compression strategy
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function compress(options) {
  var options = options || {}
    , names = Object.keys(exports.methods)
    , filter = options.filter || exports.filter;

  return function(req, res, next){
    var accept = req.headers['accept-encoding']
      , write = res.write
      , end = res.end
      , stream
      , method;

    // proxy

    res.write = function(chunk){
      if (!res.headerSent) this._implicitHeader();
      return stream.write(chunk);
    };

    res.end = function(chunk){
      if (chunk) stream.write(chunk);
      return stream.end();
    };

    function revert() {
      stream = res;
      res.write = write;
      res.end = end;
    }

    res.on('header', function(){
      // default request filter
      if (!filter(req, res)) return revert();

      // SHOULD use identity
      if (!accept) return revert();

      // default to gzip
      if ('*' == accept.trim()) method = 'gzip';

      // compression method
      if (!method) {
        for (var i = 0, len = names.length; i < len; ++i) {
          if (~accept.indexOf(names[i])) {
            method = names[i];
            break;
          }
        }
      }

      // compression method
      if (!method) return revert();

      // compression stream
      stream = exports.methods[method](options);

      // header fields
      res.setHeader('Content-Encoding', method);
      res.setHeader('Vary', 'Accept-Encoding');

      // compression

      stream.on('data', function(chunk){
        write.call(res, chunk);
      });

      stream.on('end', function(){
        end.call(res);
      });
    });

    next();
  };
}