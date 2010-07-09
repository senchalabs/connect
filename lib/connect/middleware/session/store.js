
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
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

    this.key = 'connect.sid';

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
    this.destroy(req.sessionHash, function(){
        req.session = new Session;
        fn.apply(this, arguments);
    });
};