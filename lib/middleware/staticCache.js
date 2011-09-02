
/*!
 * Connect - staticCache
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , Cache = require('../cache')
  , url = require('url')
  , fs = require('fs');

/**
 * Enables a memory cache layer on top of
 * the `static()` middleware, serving popular
 * static files.
 *
 * By default a maximum of 128 objects are
 * held in cache, with a max of 256k each,
 * totalling ~32mb.
 *
 * A Least-Recently-Used (LRU) cache algo
 * is implemented through the `Cache` object,
 * simply rotating cache objects as they are
 * hit. This means that increasingly popular
 * objects maintain their positions while
 * others get shoved out of the stack and
 * garbage collected.
 *
 * Benchmarks:
 *
 *    static(): 2700 rps
 *    node-static: 5300 rps
 *    static() + staticCache(): 7500 rps
 *
 * Options:
 *
 *   - `maxObjects`  max cache objects [128]
 *   - `maxLength`  max cache object length 256kb
 *
 * TODO: refactore to accept data stores (redis etc)
 *
 * @param {Type} name
 * @return {Type}
 * @api public
 */

module.exports = function staticCache(options){
  var options = options || {}
    , cache = new Cache(options.maxObjects || 128)
    , maxlen = options.maxLength || 1024 * 256;

  return function staticCache(req, res, next){
    var path = url.parse(req.url).pathname
      , hit = cache.get(path)
      , cc = req.headers['cache-control']
      , header;

    // cache hit
    if (hit && hit.complete) {
      // TODO: finish meeee... http caching... throttling etc
      header = hit[0];
      header.Age = (new Date - hit.createdAt) / 1000 | 0;
      
      // HEAD support
      if ('HEAD' == req.method) {
        header['content-length'] = 0;
        res.writeHead(200, header);
        return res.end();
      }

      // respond with cache
      res.writeHead(200, header);

      // backpressure
      function write(i) {
        var buf = hit[i];
        if (!buf) return res.end();
        if (false === res.write(buf)) {
          res.once('drain', function(){
            write(++i);
          });
        } else {
          write(++i);
        }
      }

      return write(1);
    }

    // cache static
    req.on('static', function(stream){
      // ignore larger files
      var contentLength = res._headers['content-length'];
      if (!contentLength || contentLength > maxlen) return;

      // exists
      if (cache.get(path)) return;

      // add the cache object
      var arr = cache.add(path);
      arr.push(res._headers);

      // store the chunks
      stream.on('data', function(chunk){
        arr.push(chunk);
      });

      // flag it as complete
      stream.on('end', function(){
        arr.complete = true;
      });
    });

    next();
  }
};

