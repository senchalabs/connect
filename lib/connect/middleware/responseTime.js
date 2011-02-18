
/*!
 * Connect - responseTime
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Adds the `X-Response-Time` header.
 *
 * @return {Function}
 * @api public
 */

module.exports = function responseTime(){
  return function(req, res, next){
    var writeHead = res.writeHead
      , start = new Date;

    // proxy writeHead to inject header
    res.writeHead = function(status, headers){
      var duration = new Date - start;
      // TODO: use setHeader() throughout only
      headers['X-Response-Time'] = duration + 'ms';
      res.writeHead = writeHead;
      res.writeHead(status, headers);
    };

    next();
  };
};
