/*!
 * Connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var proto = require('./proto');
var utils = require('./utils');

// expose createServer() as the module

exports = module.exports = createServer;

/**
 * Expose the prototype.
 */

exports.proto = proto;

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
  function app(req, res, next){ app.handle(req, res, next); }
  utils.merge(app, proto);
  utils.merge(app, EventEmitter.prototype);
  app.route = '/';
  app.stack = [];
  return app;
}
