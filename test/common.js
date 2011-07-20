
/**
 * Module dependencies.
 */

var connect = require('connect')
  , http = require('http');

/**
 * App creation helper.
 *
 * @return {HTTPServer}
 */

exports.create = function() {
  var app = connect();
  for (var i = 0, len = arguments.length; i < len; ++i) {
    app.use(arguments[i]);
  }
  return http.createServer(app);
};