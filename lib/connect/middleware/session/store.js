
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
 * Destroy session associated with the given `hash`
 * by passing `null` to `Store#get()`.
 *
 * @param {String} hash
 * @param {Function} fn
 * @api public
 */

Store.prototype.destroy = function(hash, fn){
    this.set(hash, null, fn);
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
    this.destroy(req.sessionHash, function(err, destroyed){
        req.session = new Session(req, utils.uid());
        req.sessionHash = self.hash(req);
        fn(err, destroyed);
    });
};