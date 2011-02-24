
/*!
 * Connect - limit
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Limit request bodies to the given size in `bytes`.
 *
 * When exceeded, the request will emit an "error" event,
 * and the limit can be checked via `error.limit`.
 *
 * Examples:
 *
 *     var mb = 1024 * 1024;
 *
 *     var server = connect.createServer(
 *       connect.limit(10 * mb)
 *     );
 *
 * @param {Number} bytes
 * @return {Function}
 * @api public
 */

module.exports = function limit(bytes){
  if ('number' != typeof bytes) throw new Error('limit() bytes required');
  return function limit(req, res, next){
    var received = 0
      , done;

    // limit
    req.on('data', function(chunk){
      received += chunk.length;
      if (received > bytes && !done) {
        done = true;
        var err = new Error('limit of ' + bytes + ' bytes exceeded');
        err.limit = bytes;
        req.emit('error', err);
      }
    });

    next();
  };
};