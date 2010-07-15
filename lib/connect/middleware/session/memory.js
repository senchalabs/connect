
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    Store = require('./store'),
    utils = require('./../../utils'),
    Session = require('./session');

/**
 * Initialize MemoryStore with the given options.
 *
 * @param {Object} options
 * @api public
 */

var MemoryStore = module.exports = function MemoryStore(options) {
    options = options || {};
    Store.call(this, options);
    this.sessions = {};

    // Default reapInterval to 10 minutes
    this.reapInterval = options.reapInterval || 600000;

    // Reap stale sessions
    if (this.reapInterval !== -1) {
        setInterval(function(self){
            self.reap(self.maxAge);
        }, this.reapInterval, this);
    }
};

sys.inherits(MemoryStore, Store);

/**
 * Reap sessions older than the give milliseconds.
 *
 * @param {Number} ms
 * @api private
 */

MemoryStore.prototype.reap = function(ms){
    var threshold = +new Date - ms,
        keys = Object.keys(this.sessions);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i],
            sess = this.sessions[key];
        if (sess.lastAccess < threshold) {
            delete this.sessions[key];
        }
    }
};

/**
 * Attempt to fetch session by the given `hash`.
 *
 * @param {String} hash
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.get = function(hash, fn){
    if (hash in this.sessions) {
        fn(null, this.sessions[hash]);
    } else {
        fn();
    }
};

/**
 * Commit the given `sess` object associated with the given `hash`.
 *
 * @param {String} hash
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.set = function(hash, sess, fn){
    this.sessions[hash] = sess;
    fn && fn();
};

/**
 * Destroy the session associated with the given `hash`.
 *
 * @param {String} hash
 * @api public
 */

MemoryStore.prototype.destroy = function(hash, fn){
    delete this.sessions[hash];
    fn && fn();
};


/**
 * Invoke the given callback `fn` with all active sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.all = function(fn){
    var arr = [],
        keys = Object.keys(this.sessions);
    for (var i = 0, len = keys.length; i < len; ++i) {
        arr.push(this.sessions[keys[i]]);
    }
    fn(null, arr);
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
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.length = function(fn){
    fn(null, Object.keys(this.sessions).length);
};
