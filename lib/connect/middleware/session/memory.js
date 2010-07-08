
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
    Store = require('./store').Store,
    Session = require('./session').Session;

/**
 * Initialize MemoryStore with the given options.
 *
 * @param {Object} options
 * @api public
 */

var MemoryStore = exports.MemoryStore = function MemoryStore(options) {
    options = options || {};
    Store.call(this, options);
    this.sessions = {};

    // Default reapInterval to 10 minutes
    this.reapInterval = options.reapInterval || 600000;

    // Default maxAge to 4 hours
    this.maxAge = options.maxAge || 14400000;

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
 * Destroy session for the given request.
 *
 * @param {IncomingRequest} req
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.destroy = function(req, fn){
    var key = this.fingerprint(req.session.id, req),
        destroyed = key in this.sessions;
    delete req.session;
    delete this.sessions[key];
    fn && fn(null, destroyed);
};

/**
 * Fetch Session for the given request.
 *
 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.fetch = function(req, fn){
    var sid = req.cookies[this.key],
        key = this.fingerprint(sid, req);
    if (sid && this.sessions[key]) {
        fn(null, this.sessions[key]);
    } else {
        fn();
    }
};

/**
 * Commit the given request's session.
 *
 * @param {IncomingMessage} req
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.commit = function(req, fn){
    var key = this.fingerprint(req.session.id, req);
    this.sessions[key] = req.session;
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
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.length = function(fn){
    fn(null, Object.keys(this.sessions).length);
};
