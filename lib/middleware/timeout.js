/*!
 * Connect - timeout
 * Copyright(c) 2012 Hunter Loftis
 * MIT Licensed
 */

/**
 * Timeout:
 *
 * Invokes `socket.setTimeout` to timeout idle requests
 * Adds req.clearTimeout() for long-running requests
 *
 *   - `throwError`: throw an error instead of writing a status code
 *   - `time`: timeout length in ms (default: 10000)
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function timeout(options) {
  return function(req, res, next) {

    req.socket.removeAllListeners('timeout');   // http socket auto-destroys on timeout
    req.socket.setTimeout(options.time || 10000, timed_out);

    function timed_out() {
      if (options.throwError) {
        return next(new Error('Timeout ' + at));
      }
      else {
        res.writeHead(options.code || 500);
        res.end();
      }
    }

    req.clearTimeout = function() {
      req.socket.setTimeout(0);
    };

    return next();
  };
};