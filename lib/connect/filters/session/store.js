
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
 * Inspect the store.
 *
 * @return {String}
 * @api private
 */

Store.prototype.inspect = function(){
    return '<' + this.constructor.name + '>';
};
