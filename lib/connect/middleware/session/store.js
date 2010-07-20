
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Session = require('./session'),
    utils = require('./../../utils');

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
 * Destroy session associated with the given `sid`
 * by passing `null` to `Store#get()`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

Store.prototype.destroy = function(sid, fn){
    this.set(sid, null, fn);
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
    this.destroy(req.sessionID, function(err, destroyed){
        self.generate();
        fn(err, destroyed);
    });
};