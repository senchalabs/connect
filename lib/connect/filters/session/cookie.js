
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
 * Initialize CookieStore with the given options.
 *
 * @param {Object} options
 * @api public
 */

var CookieStore = exports.CookieStore = function CookieStore(options) {
    options = options || {};
    this.key = 'connect.session';
    this.cookie = { path: '/', httpOnly: true };
    for (var key in options.cookie) {
        this.cookie[key] = options.cookie[key];
    }
};

sys.inherits(CookieStore, Store);

/**
 * Fetch session.
 *
 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

CookieStore.prototype.fetch = function(req, fn){
    var cookie = req.cookies[this.key];
    if (cookie) {
        try {
            var data = JSON.parse(utils.base64Decode(cookie).trim());
            fn(null, data);
        } catch (err) {
            fn(err);
        }
    } else {
        fn();
    }
};

/**
 * Commit session data.
 *
 * @param {IncomingRequest} req
 * @param {ServerResponse} res
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

CookieStore.prototype.commit = function(req, res, data, fn){
    data = utils.base64Encode(JSON.stringify(data));
    res.headers['Set-Cookie'] = utils.serializeCookie(this.key, data, this.cookie);
    fn && fn();
};