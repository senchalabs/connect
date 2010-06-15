
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    utils = require('./../../utils'),
    Store = require('./store').Store;

/**
 * Initialize CookieStore.
 *
 * @api public
 */

var CookieStore = exports.CookieStore = function CookieStore() {
    this.key = 'connect.session';
};

sys.inherits(CookieStore, Store);

CookieStore.prototype.fetch = function(req, fn){
    var cookie = utils.parseCookie(req.headers.cookie)[this.key];
    if (cookie) {
        var data = JSON.parse(base64Decode(cookie).trim());
        fn(null, data);
    } else {
        fn();
    }
};

CookieStore.prototype.commit = function(req, res){
    // TODO: better method for determining session alteration
    if (req.session && Object.keys(req.session).length) {
        var data = base64Encode(JSON.stringify(req.session));
        res.headers['Set-Cookie'] = utils.serializeCookie(this.key, data);
    }
};

// TODO: Move to utils / cookie utils
// TODO: get node to expose base64 :)

/*
 * base64.js - Base64 encoding and decoding functions
 *
 * See: http://developer.mozilla.org/en/docs/DOM:window.btoa
 *      http://developer.mozilla.org/en/docs/DOM:window.atob
 *
 * Copyright (c) 2007, David Lindquist <david.lindquist@gmail.com>
 * Released under the MIT license
 */

function base64Encode(str) {
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
}

function base64Decode(str) {
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
}
