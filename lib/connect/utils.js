
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Converts the given object to a Boolean.
 *
 * @param  {Mixed} obj
 * @return {Boolean}
 * @api public
 */

exports.toBoolean = function(obj) {
    return typeof obj === 'string'
        ? /^(y(es)?|true|1)$/.test(obj)
        : !! obj;
};