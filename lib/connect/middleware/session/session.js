
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../../utils');

/**
 * Create a new `Session` with the given request and `data`.
 *
 * @param {IncomingRequest} req
 * @param {Object} data
 * @api private
 */

var Session = module.exports = function Session(req, data) {
    Object.defineProperty(this, 'req', { value: req });
    Object.defineProperty(this, 'id', { value: req.sessionID });
    if (typeof data === 'object') {
        utils.merge(this, data);
    } else {
        this.touch();
    }
};

/**
 * Update lastAccess timestamp.
 *
 * @api public
 */

Session.prototype.touch = function(){
    this.lastAccess = +new Date;
};

/**
 * Destroy `this` session.
 *
 * @param {Function} fn
 * @api public
 */

Session.prototype.destroy = function(fn){
    delete this.req.session;
    this.req.sessionStore.destroy(this.req.sessionID, fn);
};

/**
 * Regenerate this request's session.
 *
 * @param {Function} fn
 * @api public
 */

Session.prototype.regenerate = function(fn){
    this.req.sessionStore.regenerate(this.req, fn);
};

