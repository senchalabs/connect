
/*!
 * Connect - header
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */

/**
 * Response header logging middleware useful for debugging.
 *
 * Examples:
 *
 *     connect()
 *     .use(connect.favicon())
 *     .use(connect.logger({ immediate: true, format: ':method :url' }))
 *     .use(connect.header())
 *     .use(function(req, res){
 *       res.setHeader('X-Foo', 'bar');
 *       res.setHeader('X-Bar', 'bar');
 *       res.setHeader('X-Baz', 'bar');
 *       res.end('Hello\n');
 *     });
 *
 *  output:
 *
 *     GET /
 *     
 *     header:
 *     x-foo: bar
 *     x-bar: bar
 *     x-baz: bar
 *
 * @api public
 */

module.exports = function(){
  return function(req, res, next){
    res.on('header', function(){
      var fields = Object.keys(res._headers);
      var header = fields.map(function(field){
        return field + ': ' + res._headers[field];
      }).join('\r\n');
      console.error('\nheader:\n' + header + '\n');
    });
    next();
  }
};
