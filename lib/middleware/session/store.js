
/*!
 * Connect - session - Store
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Session = require('./session')
  , utils = require('../../utils');

/**
 * Initialize abstract Store.
 *
 * @api private
 */

var Store = module.exports = function Store(options) {
  options = options || {};

  // Default maxAge to 4 hours
  this.maxAge = options.maxAge || 14400000;

  // Cookie options
  this.cookie = utils.merge({ path: '/', httpOnly: true }, options.cookie);
};

/**
 * Re-generate the given requests's session.
 *
 * @param {IncomingRequest} req
 * @return {Function} fn
 * @api public
 */

Store.prototype.regenerate = function(req, fn){
  var self = this;
  this.destroy(req.sessionID, function(err){
    self.generate();
    fn(err);
  });
};