
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
    this.key = 'connect.sid';
    this.sessions = {};
    for (var key in options) {
        this[key] = options[key];
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
    // TODO: test against remoteaddress
    var sid = req.cookies[this.key];
    if (sid && sid in this.sessions) {
        var sess = this.sessions[sid];
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
 * Commit session data to the given request.
 *
 * @param {Object} data
 * @param {ServerResponse} res
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.commit = function(data, res, fn){
    data.id = data.id || utils.uid();
    this.sessions[data.id] = data;
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
