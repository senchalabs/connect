
/*!
 * Connect - profiler
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

var os = require('os');

/**
 * Profile the duration of a request.
 *
 * Typically this middleware should be utilized
 * _above_ all others, as it proxies the `res.end()`
 * method, being first allows it to encapsulate all
 * other middleware.
 *
 * Currently only the _response time_ in milliseconds,
 * and memory usage are included in the profile.
 *
 * Example Output:
 *
 *     GET /
 *     response time: 1ms
 *     memory usage: 5.00mb
 *
 * @api public
 */

module.exports = function profiler(){
  return function(req, res, next){
    var end = res.end
      , start = snapshot();

    // state snapshot
    function snapshot() {
      return {
          free: os.freemem()
        , time: new Date
      };
    }

    // proxy res.end()
    res.end = function(data, encoding){
      res.end = end;
      res.end(data, encoding);
      compare(req, start, snapshot())
    };

    next();
  }
};

/**
 * Compare `start` / `end` snapshots.
 *
 * @param {IncomingRequest} req
 * @param {Object} start
 * @param {Object} end
 * @api private
 */

function compare(req, start, end) {
  var total = os.totalmem()
    , free = end.free - start.free
    , duration = end.time - start.time;

  console.log();
  row(req.method, req.url);
  row('response time:', duration + 'ms');
  row('memory usage:', free > 0 ? formatBytes(free) : 0);
  console.log();
}

function row(key, val) {
  console.log('  \033[90m%s\033[0m \033[36m%s\033[0m', key, val);
}

/**
 * Format byte-size.
 *
 * @param {Number} bytes
 * @return {String}
 * @api private
 */

function formatBytes(bytes) {
  var kb = 1024
    , mb = 1024 * kb
    , gb = 1024 * mb;
  if (bytes < kb) return bytes + 'b';
  if (bytes < mb) return (bytes / kb).toFixed(2) + 'kb';
  if (bytes < gb) return (bytes / mb).toFixed(2) + 'mb';
  return (bytes / gb).toFixed(2) + 'gb';
};