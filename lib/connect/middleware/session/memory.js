
/*!
 * Connect - session - MemoryStore
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Store = require('./store')
  , utils = require('../../utils')
  , Session = require('./session');

// environment

var env = process.env.NODE_ENV;

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

  // notify user that this store is not
  // meant for a production environment
  if ('production' == env) {
    console.warn(
        'Warning: connection.session() MemoryStore is not\n'
      + 'designed for a production environment, as it will leak\n'
      + 'memory, and obviously only work within a single process.');
  }

  // Default reapInterval to 10 minutes
  this.reapInterval = options.reapInterval || 600000;

  // Reap stale sessions
  if (this.reapInterval !== -1) {
    setInterval(function(self){
      self.reap(self.maxAge);
    }, this.reapInterval, this);
  }
};

/**
 * Inherit from `Store.prototype`.
 */

MemoryStore.prototype.__proto__ = Store.prototype;

/**
 * Reap sessions older than the give milliseconds.
 *
 * @param {Number} ms
 * @api private
 */

MemoryStore.prototype.reap = function(ms){
  var threshold = +new Date - ms
    , keys = Object.keys(this.sessions);
  for (var i = 0, len = keys.length; i < len; ++i) {
    var key = keys[i],
        sess = this.sessions[key];
    if (sess.lastAccess < threshold) {
      delete this.sessions[key];
    }
  }
};

/**
 * Attempt to fetch session by the given `sid`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.get = function(sid, fn){
  if (sid in this.sessions) {
    fn(null, this.sessions[sid]);
  } else {
    fn();
  }
};

/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.set = function(sid, sess, fn){
  this.sessions[sid] = sess;
  fn && fn();
};

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */

MemoryStore.prototype.destroy = function(sid, fn){
  delete this.sessions[sid];
  fn && fn();
};

/**
 * Invoke the given callback `fn` with all active sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.all = function(fn){
  var arr = []
    , keys = Object.keys(this.sessions);
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
