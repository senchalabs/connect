
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
 * Parse mini markdown implementation.
 * The following conversions are supported,
 * primarily for the "flash" middleware:
 *
 *    _foo_ or *foo* become <em>foo</em>
 *    __foo__ or **foo** become <strong>foo</strong>
 *    [A](B) becomes <a href="B">A</a>
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

exports.miniMarkdown = function(str){
    return String(str)
        .replace(/(__|\*\*)(.*?)\1/g, '<strong>$2</strong>')
        .replace(/(_|\*)(.*?)\1/g, '<em>$2</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
};

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api public
 */

exports.htmlEscape = function(html) {
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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

// TODO: expose node crypto base64 :)

/**
 * Base64 encode the given string.
 *
 * Copyright (c) 2007, David Lindquist <david.lindquist@gmail.com>
 * Released under the MIT license
 *
 * @param  {String} str
 * @return {String}
 * @api public
 */

exports.base64Encode = function(str){
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var encoded = [];
    var c = 0;
    while (c < str.length) {
        var b0 = str.charCodeAt(c++);
        var b1 = str.charCodeAt(c++);
        var b2 = str.charCodeAt(c++);
        var buf = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);
        var i0 = (buf & (63 << 18)) >> 18;
        var i1 = (buf & (63 << 12)) >> 12;
        var i2 = isNaN(b1) ? 64 : (buf & (63 << 6)) >> 6;
        var i3 = isNaN(b2) ? 64 : (buf & 63);
        encoded[encoded.length] = chars.charAt(i0);
        encoded[encoded.length] = chars.charAt(i1);
        encoded[encoded.length] = chars.charAt(i2);
        encoded[encoded.length] = chars.charAt(i3);
    }
    return encoded.join('');
};

/**
 * Decode the given Base64 string.
 *
 * Copyright (c) 2007, David Lindquist <david.lindquist@gmail.com>
 * Released under the MIT license
 *
 * @param  {String} str
 * @return {String}
 * @api public
 */


exports.base64Decode = function(str){
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var invalid = {
        strlen: (str.length % 4 != 0),
        chars:  new RegExp('[^' + chars + ']').test(str),
        equals: (/=/.test(str) && (/=[^=]/.test(str) || /={3}/.test(str)))
    };
    if (invalid.strlen || invalid.chars || invalid.equals)
        throw new Error('Invalid base64 data');
    var decoded = [];
    var c = 0;
    while (c < str.length) {
        var i0 = chars.indexOf(str.charAt(c++));
        var i1 = chars.indexOf(str.charAt(c++));
        var i2 = chars.indexOf(str.charAt(c++));
        var i3 = chars.indexOf(str.charAt(c++));
        var buf = (i0 << 18) + (i1 << 12) + ((i2 & 63) << 6) + (i3 & 63);
        var b0 = (buf & (255 << 16)) >> 16;
        var b1 = (i2 == 64) ? -1 : (buf & (255 << 8)) >> 8;
        var b2 = (i3 == 64) ? -1 : (buf & 255);
        decoded[decoded.length] = String.fromCharCode(b0);
        if (b1 >= 0) decoded[decoded.length] = String.fromCharCode(b1);
        if (b2 >= 0) decoded[decoded.length] = String.fromCharCode(b2);
    }
    return decoded.join('');
};
