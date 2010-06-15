
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
 * Commit session data to the given request.
 *
 * @param {Object} data
 * @param {ServerResponse} res
 * @param {Function} fn
 * @api public
 */

Store.prototype.commit = function(data, res, fn){
    throw new Error(this.constructor.name + ' does not implement #commit().');
};

/**
 * Fetch number of sesstions.
 *
 * @param {Function} fn
 * @api public
 */

Store.prototype.length = function(fn){
    fn(null, 0);
};

/**
 * Inspect the store.
 *
 * @return {String}
 * @api private
 */

Store.prototype.inspect = function(){
    return '<' + this.constructor.name + '>';
};
