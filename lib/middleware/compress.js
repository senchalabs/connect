
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
  return type.match(/json|text|javascript/);
};

/**
 * Compress response data with gzip/deflate.
 *
 * Filter:
 *
 * A `filter` callback function may be passed to
 * replace the default logic of:
 *
 *     exports.filter = function(req, res){
 *       var type = res.getHeader('Content-Type') || '';
 *       return type.match(/json|text|javascript/);
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

    // vary
    res.setHeader('Vary', 'Accept-Encoding');

    // proxy

    res.write = function(chunk, encoding){
      if (!this.headerSent) this._implicitHeader();
      return stream.write(chunk, encoding);
    };

    res.end = function(chunk, encoding){
      if (!this.headerSent) this._implicitHeader();
      if (chunk) this.write(chunk, encoding);
      return stream.end();
    };

    function revert() {
      stream = res;
      res.write = write;
      res.end = end;
    }

    // head
    if ('HEAD' == req.method) revert();

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
      res.removeHeader('Content-Length');

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