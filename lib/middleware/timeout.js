/*!
 * Connect - timeout
 * Ported from https://github.com/LearnBoost/connect-timeout
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
    var writeHead = res.writeHead,
        at = req.method + ' ' + req.url,
        timer = setTimeout(function() {
          if (options.throwError) {
            return next(new Error('Timeout ' + req.method + ' ' + req.url));
          }
          res.writeHead(options.code);
          res.end();
        }, options.time);

    req.clearTimeout = function() {
      clearTimeout(timer);
    };

    res.writeHead = function() {
      res.writeHead = writeHead;
      req.clearTimeout();
      return res.writeHead.apply(res, arguments);
    }

    return next();
  };
};