
/*!
 * Connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Framework version.
 */

exports.version = '1.0.0';

/**
 * Module dependencies.
 */

var HTTPServer = require('./http').Server
  , HTTPSServer = require('./https').Server
  , fs = require('fs');

// node patches

require('./patch');

/**
 * Initialize a new `connect.HTTPServer` with the middleware
 * passed to this function. When an object is passed _first_,
 * we assume these are the tls options, and return a `connect.HTTPSServer`.
 *
 * Examples:
 *
 * An example HTTP server, accepting several middleware.
 *
 *     var server = connect.createServer(
 *         connect.logger()
 *       , connect.static(__dirname + '/public')
 *     );
 *
 * An HTTPS server, utilizing the same middleware as above.
 *
 *     var server = connect.createServer(
 *         { key: key, cert: cert }
 *       , connect.logger()
 *       , connect.static(__dirname + '/public')
 *     );
 *
 * @param  {Object|Function} ...
 * @return {Server}
 * @api public
 */

exports.createServer = function() {
  if ('object' == typeof arguments[0]) {
    return new HTTPSServer(arguments[0], Array.prototype.slice.call(arguments, 1));
  } else {
    return new HTTPServer(Array.prototype.slice.call(arguments));
  }
};

/**
 * Auto-load getters.
 */

exports.middleware = {};

/**
 * Auto-load bundled middleware with getters.
 */

fs.readdirSync(__dirname + '/middleware').forEach(function(filename){
  if (/\.js$/.test(filename)) {
    var name = filename.substr(0, filename.lastIndexOf('.'));
    exports.middleware.__defineGetter__(name, function(){
      return require('./middleware/' + name);
    });
  }
});

/**
 * Expose getters as first-class exports.
 */

exports.__proto__ = exports.middleware;

/**
 * Expose utils.
 */

exports.utils = require('./utils');

/**
 * Expose constructors.
 */

exports.HTTPServer = HTTPServer;
exports.HTTPSServer = HTTPSServer;

