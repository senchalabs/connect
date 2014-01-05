
/*!
 * Connect - responseTime
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Reponse time:
 *
 * Adds the `X-Response-Time` header displaying the response
 * duration in milliseconds.
 *
 * @return {Function}
 * @api public
 */

module.exports = function responseTime(){
  return function(req, res, next){
    var writeHead = res.writeHead;
    var start = new Date;

    if (res._responseTime) return next();
    res._responseTime = true;

    res.writeHead = function(){
      var duration = new Date - start;
      res.setHeader('X-Response-Time', duration + 'ms');
      writeHead.apply(res, arguments);
    };

    next();
  };
};
