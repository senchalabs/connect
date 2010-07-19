
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
 * Create a new `Session` with the given request and `id`.
 * When `Store#get()` is called `id` becomes the session
 * data itself, at which time `id`'s properties are
 * applied to the `Session` instance.
 *
 * Examples:
 *
 *     new Session(req, 'asdfsfd');
 *     new Session(req, { id: 'asdfsadfa', name: 'tj' });
 *
 * @param {IncomingRequest} req
 * @param {String|Object} id or data
 * @api private
 */

var Session = module.exports = function Session(req, id) {
    Object.defineProperty(this, 'req', { value: req });
    if (typeof id === 'object') {
        utils.merge(this, id);
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
    this.req.sessionStore.destroy(this.req.sessionHash, fn);
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

