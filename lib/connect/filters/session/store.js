
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Initialize abstract Store.
 *
 * @api private
 */

var Store = exports.Store = function Store() {
    throw new Error('Do not instantiate the abstract session Store.');
};

/**
 * Fetch session.
 *
 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

Store.prototype.fetch = function(req, fn){
    throw new Error(this.constructor.name + ' does not implement #fetch().');
};

/**
 * Commit session data.
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

Store.prototype.commit = function(req, res, data, fn){
    throw new Error(this.constructor.name + ' does not implement #commit().');
};

/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */

Store.prototype.clear = function(fn){
    throw new Error(this.constructor.name + ' does not implement #clear().');
};

/**
 * Fetch number of sesstions.
 *
 * @param {Function} fn
 * @api public
 */

Store.prototype.length = function(fn){
    throw new Error(this.constructor.name + ' does not implement #length().');
};
