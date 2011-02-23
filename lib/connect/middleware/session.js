
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
  options = options || {};

  // cookie name
  var key = options.key || 'connect.sid';

  // default memory store
  var store = options.store || new MemoryStore;

  // notify user that this store is not
  // meant for a production environment
  if ('production' == env && store instanceof MemoryStore) {
    console.warn(
        'Warning: connection.session() MemoryStore is not\n'
      + 'designed for a production environment, as it will leak\n'
      + 'memory, and obviously only work within a single process.');
  }

  // default session hash fingerprint function
  var fingerprint = options.fingerprint || function fingerprint(req) {
    return req.headers['user-agent'] || '';
  };

  // ensure secret is present
  if (!options.secret) {
    throw new Error('connect.session({ secret: "string" }) required for security');
  }

  var secret = options.secret;

  return function session(req, res, next) {
    var pause = utils.pause(req);

    // proxy writeHead() to Set-Cookie
    var writeHead = res.writeHead;
    res.writeHead = function(status, headers){

      // update the session in the store if there is one
      if (req.session) {
        req.session.touch();
        store.set(req.sessionID, req.session);
      }

      // Only send secure session cookies when there is a secure connection.
      // proxySecure is a custom attribute to allow for a reverse proxy to handle SSL connections and to
      // communicate to connect over HTTP that the incoming connection is secure.
      var secured = store.cookie.secure && (req.connection.secure || req.connection.proxySecure);
      if (secured || !store.cookie.secure) {
        // Send an updated cookie to the browser
        store.cookie.expires = false === store.cookie.persistent
          ? null
          : new Date(Date.now() + store.maxAge);

        // Multiple Set-Cookie headers
        headers = headers || {};
        var cookie = utils.serializeCookie(key, req.sessionID, store.cookie);
        res.setHeader('Set-Cookie', cookie);
      }

      // Pass through the writeHead call
      res.writeHead = writeHead;
      return res.writeHead(status, headers);
    };

    // Calculates the security hash to prevent session hijacking
    // Uses information on the user-agent that created the session as it's fingerprint
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
        var sessionID = base + "." + hash(base);
        req.sessionID = sessionID;
        req.session = new Session(req);
    };

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
    store.get(req.sessionID, function (err, sess) {
      pause.end();

      // error/missing handling
      if (err) {
        if (err.errno === process.ENOENT) {
          // if the session ID is invalid, generate a new session
          generate();
          next();
        } else {
          // otherwise pass the exception along
          next(err);
        }
        pause.resume();
        return;
      }
      if (!sess) {
        // some stores use a falsy result to signify no result
        generate();
        next();
        pause.resume();
        return;
      }

      // load the session into the request
      req.session = new Session(req, sess);
      next();
      pause.resume();
    });
  };
};
