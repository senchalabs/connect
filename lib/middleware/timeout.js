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
  options = options || {};
  options.time = options.time || 8000;
  options.code = options.code || 500;
  options.throwError = options.throwError || false;

  return function(req, res, next) {

    req.socket.removeAllListeners('timeout');   // http socket auto-destroys on timeout
    req.socket.setTimeout(options.time, timed_out);

    function timed_out() {
      if (options.throwError) {
        return next(new Error('Timeout ' + req.method + ' ' + req.url));
      }
      else {
        res.writeHead(options.code);
        res.end();
      }
    }

    req.clearTimeout = function() {
      req.socket.setTimeout(0);
    };

    return next();
  };
};