
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
    this.sessions = {};
    options = options || {};
    this.key = 'connect.sid';
    
    // Default reapInterval to 10 minutes
    this.reapInterval = options.reapInterval || 600000;
    
    // Default maxAge to 4 hours
    this.maxAge = options.maxAge || 14400000;
    
    // Cookie options
    this.cookie = ({ path: '/', httpOnly: true }).mixin(options.cookie);
    
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
        sids = Object.keys(this.sessions);
    for (var i = 0, len = sids.length; i < len; ++i) {
        var sid = sids[i],
            sess = this.sessions[sid];
        if (sess.lastAccess < threshold) {
            this.destroy(sid);
        }
    }
};

/**
 * Destroy the given sid, and invoke the
 * optional callback function with a possible
 * error, and boolean representing if the
 * session was destroyed (or did not exist).
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.destroy = function(sid, fn){
    var destroyed = sid in this.sessions;
    delete this.sessions[sid];
    fn && fn(null, destroyed);
};

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
    this.cookie.expires = new Date(+new Date() + this.maxAge);
    res.headers['Set-Cookie'] = utils.serializeCookie(this.key, data.id, this.cookie);
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
