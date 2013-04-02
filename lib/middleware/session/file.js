
/*!
 * Connect - session - FileStore
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , os = require('os')
  , path = require('path')
  , Store = require('./store');

/**
 * Initialize a new `FileStore`.
 *
 * @api public
 */

var FileStore = module.exports = function FileStore(options) {
  var savePath;
  options = options || {};

  savePath = this.savePath = options.path || path.join(os.tmpdir(), 'connect.sessions');
  fs.exists(savePath, function(exists){
    if (!exists) {
      fs.mkdir(savePath, function(err){
        if (err) throw err;
      });
    }
  });
};

/**
 * Inherit from `Store.prototype`.
 */

FileStore.prototype.__proto__ = Store.prototype;


/**
 * Attempt to fetch session by the given `sid`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

FileStore.prototype.get = function(sid, fn){
  var self = this
    , filename = path.join(this.savePath, sid);

  fs.exists(filename, function(exists){
    if (!exists) {
      return fn();
    }
    fs.readFile(filename, {encoding: 'utf8'}, function(err, data){
      if (err) throw err;

      var expires
        , sess = JSON.parse(data);

      expires = 'string' == typeof sess.cookie.expires
        ? new Date(sess.cookie.expires)
        : sess.cookie.expires;

      if (!expires || new Date < expires) {
        fn(null, sess);
      }
      else {
        self.destroy(sid, fn);
      }
    });
  });
};

/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

FileStore.prototype.set = function(sid, sess, fn){
  var filename = path.join(this.savePath, sid);

  fs.writeFile(filename, JSON.stringify(sess), function(err){
    fn && fn(err);
  });
};

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */

FileStore.prototype.destroy = function(sid, fn){
  var filename = path.join(this.savePath, sid);

  fs.exists(filename, function(exists){
    if (!exists) {
      return fn();
    }
    fs.unlink(filename, function(err){
      fn && fn(err);
    });
  });
};
