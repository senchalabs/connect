
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var queryString = require('querystring');

/**
 * Converts the given object to a Boolean.
 *
 * @param  {Mixed} obj
 * @return {Boolean}
 * @api public
 */

exports.toBoolean = function(obj){
    return typeof obj === 'string'
        ? /^(y(es)?|true|1)$/.test(obj)
        : !! obj;
};

/**
 * Return a unique identifier.
 *
 * @return {String}
 * @api public
 */

exports.uid = function() {
    var uid = '';
    for (var n = 4; n; --n) {
        uid += (Math.abs((Math.random() * 0xFFFFFFF) | 0)).toString(16);
    }
    return uid;
};

/**
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parseCookie = function(str){
    var obj = {},
        pairs = str.split(/[;,] */);
    for (var i = 0, len = pairs.length; i < len; ++i) {
        var pair = pairs[i],
            eqlIndex = pair.indexOf('='),
            key = pair.substr(0, eqlIndex).trim().toLowerCase(),
            val = pair.substr(++eqlIndex, pair.length).trim();
        // Quoted values
        if (val[0] === '"') {
            val = val.slice(1, -1);
        }
        // Only assign once
        if (obj[key] === undefined) {
            obj[key] = queryString.unescape(val, true);
        }
    }
    return obj;
};

/**
 * Serialize the given object into a cookie string.
 *
 * @param {String} name
 * @param {String} val
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.serializeCookie = function(name, val, obj){
    var pairs = [name + '=' + queryString.escape(val)],
        obj = obj || {},
        keys = Object.keys(obj);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i],
            val = obj[key];
        if (val instanceof Date) {
            val = val.toUTCString();
        } else if (typeof val === "boolean") {
            if (val === true) {
                pairs.push(key);
            }
            continue;
        }
        pairs.push(key + '=' + val);
    }
    return pairs.join('; ');
};
