
/*!
 * Connect - header
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */

/**
 * Request / response header logging middleware useful for debugging.
 *
 * Examples:
 *
 *     connect()
 *     .use(connect.header())
 *     .use(connect.favicon())
 *     .use(connect.logger({ immediate: true, format: ':method :url' }))
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
    output('Request', req.headers);

    res.on('header', function(){
      output('Response', res._headers);
    });

    next();
  }
};

/**
 * Output `header` fields with the given `title`.
 */

function output(title, header) {
  var fields = Object.keys(header);
  var str = fields.map(function(field){
    return '\033[90m' + field + ':\033[36m ' + header[field] + '\033[0m';
  }).join('\r\n');
  console.error('%s:\n%s\n', title, str);
}