
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../../utils');

/**
 * TODO: ....
 *
 * Examples:
 *
 *     new Session(req, 'asdfsfd');
 *     new Session(req, { id: 'asdfsadfa', name: 'tj' });
 *
 * @param {IncomingRequest} req
 * @param {String|Object} id
 * @api public
 */

var Session = module.exports = function Session(req, id) {
    Object.defineProperty(this, 'req', { value: req });
    if (typeof id === 'object') {
        utils.merge(this, id);
    } else {
        this.id = id;
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

