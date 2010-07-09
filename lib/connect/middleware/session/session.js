
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
 *     new Session(req);
 *     new Session(req, data);
 *
 * @param {IncomingRequest} req
 * @api public
 */

var Session = module.exports = function Session(req, data) {
    Object.defineProperty(this, 'req', { value: req });
    this.id = req.sessionId;
    if (data) {
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

