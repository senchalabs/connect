
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
 * Initialize MemoryStore with the given options.
 *
 * @param {Object} options
 * @api public
 */

var MemoryStore = exports.MemoryStore = function MemoryStore(options) {
    options = options || {};
    this.key = 'connect.sid';
    this.sessions = {};
    this.cookie = { path: '/', httpOnly: true };
    for (var key in options.cookie) {
        this.cookie[key] = options.cookie[key];
    }
};

sys.inherits(MemoryStore, Store);

/**
 * Fetch session.
 *
 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.fetch = function(req, fn){
    var sid = req.cookies[this.key],
        key = req.socket.remoteAddress + ':' + sid;
    if (sid && this.sessions[key]) {
        var sess = this.sessions[key];
        sess.id = sid;
        sess.lastAccess = +new Date;
        fn(null, sess);
    } else {
        fn(null, { 
            id: utils.uid(),
            lastAccess: +new Date
        });
    }
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

MemoryStore.prototype.commit = function(req, res, data, fn){
    data.id = data.id || utils.uid();
    var key = req.socket.remoteAddress + ':' + data.id;
    this.sessions[key] = data;
    res.headers['Set-Cookie'] = utils.serializeCookie(this.key, data.id);
    fn && fn();
};

/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.clear = function(fn){
    this.sessions = {};
    fn && fn();
};

/**
 * Fetch number of sesstions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.length = function(fn){
    fn(null, Object.keys(this.sessions).length);
};
