
/*!
 * Connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var proto = require('./proto')
  , utils = require('./utils')
  , fs = require('fs');

// node patches

require('./patch');

// expose createServer() as the module

exports = module.exports = createServer;

/**
 * Framework version.
 */

exports.version = '1.6.0';

/**
 * Auto-load middleware getters.
 */

exports.middleware = {};

/**
 * Expose utilities.
 */

exports.utils = utils;

/**
 * Create a new connect server.
 *
 * @return {Function}
 * @api public
 */

function createServer() {
  function app(req, res){ app.handle(req, res); }
  utils.merge(app, proto);
  app.stack = [];
  return app;
};

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

utils.merge(exports, exports.middleware);
