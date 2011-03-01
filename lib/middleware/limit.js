
/*!
 * Connect - limit
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Limit request bodies to the given size in `bytes`.
 *
 * When exceeded, the request will emit an "error" event,
 * and the limit can be checked via `error.limit`.
 *
 * A string representation of the bytesize may also be passed,
 * for example "5mb", "200kb", "1gb", etc.
 *
 * Examples:
 *
 *     var server = connect(
 *       connect.limit('5.5mb')
 *     ).listen(3000);
 *
 * @param {Number|String} bytes
 * @return {Function}
 * @api public
 */

module.exports = function limit(bytes){
  if ('string' == typeof bytes) bytes = parse(bytes);
  if ('number' != typeof bytes) throw new Error('limit() bytes required');
  return function limit(req, res, next){
    var received = 0
      , done;

    // self-awareness
    if (req._limit) return next();
    req._limit = true;

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

/**
 * Parse byte `size` string.
 *
 * @param {String} size
 * @return {Number}
 * @api private
 */

function parse(size) {
  var parts = size.match(/^(\d+(?:\.\d+)?) *(kb|mb|gb)$/)
    , n = parseFloat(parts[1])
    , type = parts[2];

  var map = {
      kb: 1024
    , mb: 1024 * 1024
    , gb: 1024 * 1024 * 1024
  };

  return map[type] * n;
}