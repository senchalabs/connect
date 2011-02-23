
/*!
 * Connect - session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Session = require('./session/session')
  , MemoryStore = require('./session/memory')
  , Store = require('./session/store')
  , utils = require('./../utils')
  , crypto = require('crypto');

// environment

var env = process.env.NODE_ENV;

/**
 * Expose the middleware.
 */

exports = module.exports = session;

/**
 * Expose constructors.
 */

exports.Store = Store;
exports.Session = Session;
exports.MemoryStore = MemoryStore;

/**
 * Warning message for `MemoryStore` usage in production.
 */
var warning = 'Warning: connection.session() MemoryStore is not\n'
  + 'designed for a production environment, as it will leak\n'
  + 'memory, and obviously only work within a single process.';

/**
 * Setup session store with the given `options`.
 *
 * Options:
 *
 *   - `key`           cookie name defaulting to `session.sid
 *   - `store`         Session store instance
 *   - `fingerprint`   Custom fingerprint generating function
 *   - `secret`        Secret string used to compute hash
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

function session(options){
  var options = options || {}
    , key = options.key || 'connect.sid'
    , secret = options.secret
    , store = options.store || new MemoryStore;

  // notify user that this store is not
  // meant for a production environment
  if ('production' == env && store instanceof MemoryStore) {
    console.warn(warning);
  }

  // default session hash fingerprint function
  var fingerprint = options.fingerprint || function fingerprint(req) {
    return req.headers['user-agent'] || '';
  };

  // ensure secret is present
  if (!secret) {
    throw new Error('connect.session({ secret: "string" }) required for security');
  }

  return function session(req, res, next) {
    // proxy writeHead() to Set-Cookie
    var writeHead = res.writeHead;
    res.writeHead = function(status, headers){
      // only send secure session cookies when there is a secure connection.
      // proxySecure is a custom attribute to allow for a reverse proxy
      // to handle SSL connections and to communicate to connect over HTTP that
      // the incoming connection is secure.
      var secured = store.cookie.secure && (req.connection.secure || req.connection.proxySecure);
      if (req.session && (secured || !store.cookie.secure)) {
        // Send an updated cookie to the browser
        store.cookie.expires = false === store.cookie.persistent
          ? null
          : new Date(Date.now() + store.maxAge);

        var cookie = utils.serializeCookie(key, req.sessionID, store.cookie);
        res.setHeader('Set-Cookie', cookie);
      }

      res.writeHead = writeHead;
      return res.writeHead(status, headers);
    };

    // proxy end() to commit the session
    var end = res.end;
    res.end = function(data, encoding){
      res.end = end;
      if (req.session) {
        req.session.touch();
        store.set(req.sessionID, req.session, function(){
          res.end(data, encoding);
        });
      } else {
        res.end(data, encoding);
      }
    };

    // session hashing function
    function hash(base) {
      return crypto
        .createHmac('sha256', secret)
        .update(base + fingerprint(req))
        .digest('base64')
        .replace(/=*$/, '');
    }

    // generates the new session
    var generate = store.generate = function(){
      var base = utils.uid(24);
      var sessionID = base + '.' + hash(base);
      req.sessionID = sessionID;
      req.session = new Session(req);
    };

    // remove session cookie

    // expose store
    req.sessionStore = store;

    // get the sessionID from the cookie
    req.sessionID = req.cookies[key];

    // make a new session if the browser doesn't send a sessionID
    if (!req.sessionID) {
        generate();
        next();
        return;
    }

    // check the fingerprint
    var parts = req.sessionID.split('.');
    if (parts[1] !== hash(parts[0])) {
      // Make a new session if it doesn't check out
      generate();
      next();
      return;
    }

    // generate the session object
    var pause = utils.pause(req);
    store.get(req.sessionID, function (err, sess) {
      // proxy to resume() events
      var _next = next;
      next = function(err){
        _next(err);
        pause.resume();
      }

      // error handling
      if (err) {
        if ('ENOENT' == err.code) {
          generate();
          next();
        } else {
          next(err);
        }
      // no session
      } else if (!sess) {
        generate();
        next();
      // populate req.session
      } else {
        req.session = new Session(req, sess);
        next();
      }
    });
  };
};
