
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Session = require('./session').Session,
    utils = require('./../../utils');

/**
 * Initialize abstract Store.

 * @api private
 */

var Store = exports.Store = function Store() {
    throw new Error('Do not instantiate the abstract session Store.');
};

/**
 * Fetch session for the given request.

 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

Store.prototype.fetch = function(req, fn){
    throw new Error(this.constructor.name + ' does not implement #fetch().');
};

/**
 * Commit the given request's session.

 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

Store.prototype.commit = function(req, fn){
    throw new Error(this.constructor.name + ' does not implement #commit().');
};

/**
 * Clear all sessions.

 * @param {Function} fn
 * @api public
 */

Store.prototype.clear = function(fn){
    throw new Error(this.constructor.name + ' does not implement #clear().');
};

/**
 * Destroy session for the given request.

 * @param {IncomingRequest} req
 * @param {Function} fn
 * @api public
 */

Store.prototype.destroy = function(req, fn){
    throw new Error(this.constructor.name + ' does not implement #destroy().');
};

/**
 * Re-generate the given requests's session.

 * @param {IncomingRequest} req
 * @return {Function} fn
 * @api public
 */

Store.prototype.regenerate = function(req, fn){
    this.destroy(req, function(){
        req.session = req.sessionStore.createSession();
        fn.apply(this, arguments);
    });
};

/**
 * Fetch number of sessions.

 * @param {Function} fn
 * @api public
 */

Store.prototype.length = function(fn){
    throw new Error(this.constructor.name + ' does not implement #length().');
};

/**
 * Create a new Session instance.

 * @return {Session}
 * @api public
 */

Store.prototype.createSession = function(){
    return new Session(utils.uid());
};
