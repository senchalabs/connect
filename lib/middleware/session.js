/*!
 * This is a modification of the original connect/session handler by:
 *
 * Connect - session
 *
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 *
 * The modifications are
 *
 * Copyright(c) 2011 triAGENS GmbH, Cologne, Germany
 * MIT Licensed
 */

// -----------------------------------------------------------------------------
// Module declarations
// -----------------------------------------------------------------------------

/**
 * Module dependencies.
 */

var Session = require('./session/session')
  , MemoryStore = require('./session/memory')
  , Cookie = require('./session/cookie')
  , Store = require('./session/store')
  , utils = require('./../utils')
  , parse = require('url').parse
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
exports.Cookie = Cookie;
exports.Session = Session;
exports.MemoryStore = MemoryStore;

/**
 * Warning message for `MemoryStore` usage in production.
 */

var warning = 'Warning: connection.session() MemoryStore is not\n'
  + 'designed for a production environment, as it will leak\n'
  + 'memory, and obviously only work within a single process.';

/**
 * Show debug information
 */

exports.debug = true;

/**
 * Paths to ignore, defaulting to `/favicon.ico`.
 */

exports.ignore = ['/favicon.ico'];

// -----------------------------------------------------------------------------
// Private functions and variables
// -----------------------------------------------------------------------------

/**
 * Default finger-printing function.
 */

function defaultFingerprint (req) {
  return req.headers['user-agent'] || '';
};

/**
 * Debug logging
 */

function debuglog (msg) {
  if (exports.debug) {
    console.log("SESSION      ### " + msg);
  }
}

/**
 * Hashing
 */

function hash (base, secret, fingerprint) {
  return crypto
    .createHmac('sha256', secret)
    .update(base + fingerprint)
    .digest('base64')
    .replace(/=*$/, '');
}

// -----------------------------------------------------------------------------
// Store modifications
// -----------------------------------------------------------------------------

/**
 * Add a `isSecretRequired` method to Store. The default function will always
 * return true.
 */

Store.prototype.isSecretRequired = function () {
  return true;
};

/**
 * Add a `generate` method to Store. The default function will generate a 24
 * character session identifier.
 */

Store.prototype.generate = function (secret, fingerprint, next) {
  var sid = utils.uid(24);

  next(null, sid + "." + hash(sid, secret, fingerprint));
};

/**
 * Add a `create` method to Store. The default function will create an empty session
 * data object.
 */

Store.prototype.create = function (sid, next) {
  next(null, {});
};

/**
 * Add a `verify` method to Store. 
 */

Store.prototype.verify = function (sid, secret, fingerprint, next) {
  var parts = sid.split('.');
  
  next(null, parts[1] == hash(parts[0], secret, fingerprint));
};

/**
 * Create an session object
 */

Store.prototype.newSession = function (req, data) {
  return new Session(req, data);
};

// -----------------------------------------------------------------------------
// session handling
// -----------------------------------------------------------------------------

/**
 * Setup session store with the given `options`.
 *
 * Session data is _not_ saved in the cookie itself, however cookies are used,
 * so we must use the [cookieParser()](middleware-cookieParser.html) middleware
 * _before_ `session()`.
 *
 * Examples:
 *
 *     connect.createServer(
 *         connect.cookieParser()
 *       , connect.session({ secret: 'keyboard cat' })
 *     );
 *
 * Options:
 *
 *   - `key`           cookie name defaulting to `connect.sid`
 *   - `store`         Session store instance
 *   - `fingerprint`   Custom fingerprint generating function
 *   - `cookie`        Session cookie settings, defaulting to `{ path: '/', httpOnly: true, maxAge: 14400000 }`
 *   - `secret`        Secret string used to compute hash
 *
 * Ignore Paths:
 *
 *  By default `/favicon.ico` is the only ignored path, all others
 *  will utilize sessions, to manipulate the paths ignored, use
 * `connect.session.ignore.push('/my/path')`. This works for _full_
 *  pathnames only, not segments nor substrings.
 *
 *     connect.session.ignore.push('/robots.txt');
 *
 * ## req.session
 *
 *  To store or access session data, simply use the request property `req.session`,
 *  which is (generally) serialized as JSON by the store, so nested objects 
 *  are typically fine. For example below is a user-specific view counter:
 *
 *       connect(
 *           connect.cookieParser()
 *         , connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }})
 *         , connect.favicon()
 *         , function(req, res, next){
 *           var sess = req.session;
 *           if (sess.views) {
 *             res.setHeader('Content-Type', 'text/html');
 *             res.write('<p>views: ' + sess.views + '</p>');
 *             res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
 *             res.end();
 *             sess.views++;
 *           } else {
 *             sess.views = 1;
 *             res.end('welcome to the session demo. refresh!');
 *           }
 *         }
 *       ).listen(3000);
 *
 * ## Session#regenerate()
 *
 *  To regenerate the session simply invoke the method, once complete
 *  a new SID and `Session` instance will be initialized at `req.session`.
 *
 *      req.session.regenerate(function(err){
 *        // will have a new session here
 *      });
 *
 * ## Session#destroy()
 *
 *  Destroys the session, removing `req.session`, will be re-generated next request.
 *
 *      req.session.destroy(function(err){
 *        // cannot access session here
 *      });
 *
 * ## Session#touch()
 *
 *   Updates the `.maxAge`, and `.lastAccess` properties. Typically this is
 *   not necessary to call, as the session middleware does this for you.
 *
 * ## Session#cookie
 *
 *  Each session has a unique cookie object accompany it. This allows
 *  you to alter the session cookie per visitor. For example we can
 *  set `req.session.cookie.expires` to `false` to enable the cookie
 *  to remain for only the duration of the user-agent.
 *
 * ## Session#maxAge
 *
 *  Alternatively `req.session.cookie.maxAge` will return the time
 *  remaining in milliseconds, which we may also re-assign a new value
 *  to adjust the `.expires` property appropriately. The following
 *  are essentially equivalent
 *
 *     var hour = 3600000;
 *     req.session.cookie.expires = new Date(Date.now() + hour);
 *     req.session.cookie.maxAge = hour;
 *
 * For example when `maxAge` is set to `60000` (one minute), and 30 seconds
 * has elapsed it will return `30000` until the current request has completed,
 * at which time `req.session.touch()` is called to update `req.session.lastAccess`,
 * and reset `req.session.maxAge` to its original value.
 *
 *     req.session.cookie.maxAge;
 *     // => 30000
 *
 * Session Store Implementation:
 *
 * Every session store _must_ implement the following methods
 *
 *    - `.get(sid, callback)`
 *    - `.set(sid, session, callback)`
 *    - `.destroy(sid, callback)`
 *
 * Recommended methods include, but are not limited to:
 *
 *    - `.length(callback)`
 *    - `.clear(callback)`
 *
 * In order to adjust the session handling a store can also implement:
 *
 *    - `.isSecretRequired()`
 *    - `.generate(secrect, fingerprint, callback)`
 *    - `.create(sid, callback)`
 *    - `.verify(sid, secrect, fingerprint, callback)`
 *
 * For an example implementation view the [connect-redis](http://github.com/visionmedia/connect-redis) repo.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

function session (options){
  var options = options || {}
    , key = options.key || 'connect.sid'
    , secret = options.secret
    , secretfp = ""
    , store = options.store || new MemoryStore
    , fingerprint = options.fingerprint || defaultFingerprint
    , cookie = options.cookie;

  // .............................................................................
  // sanity checks
  // .............................................................................

  // notify user that this store is not
  // meant for a production environment

  if ('production' == env && store instanceof MemoryStore) {
    console.warn(warning);
  }

  // ensure secret is present
  if (!secret) {
    if (store.isSecretRequired()) {
      throw new Error('session({ secret: "string" }) required for security');
    }
    else {
      secret = "";
    }
  }

  // .............................................................................
  // session middleware generator
  // .............................................................................

  return function (req, res, next) {

    // self-awareness
    if (req.session) {
      return next();
    }

    // parse url
    var url = parse(req.url)
      , path = url.pathname;

    // ignorable paths
    if (~exports.ignore.indexOf(path)) {
      return next();
    }

    // expose store
    req.sessionStore = store;

    // .............................................................................
    // proxy writeHead() to Set-Cookie
    // .............................................................................

    var writeHead = res.writeHead;

    res.writeHead = function (status, headers) {
      res.writeHead = writeHead;

      if (req.session) {
        var cookie = req.session.cookie;

        // only send secure session cookies when there is a secure connection.
        // proxySecure is a custom attribute to allow for a reverse proxy
        // to handle SSL connections and to communicate to connect over HTTP that
        // the incoming connection is secure.
        var secured = cookie.secure && (req.connection.encrypted || req.connection.proxySecure);

        if (secured || !cookie.secure) {
          res.setHeader('Set-Cookie', cookie.serialize(key, req.sessionID));
        }
      }

      return res.writeHead(status, headers);
    };

    // .............................................................................
    // proxy end() to commit the session
    // .............................................................................

    var end = res.end;

    res.end = function (data, encoding) {
      res.end = end;

      if (req.session) {

        // HACK: ensure Set-Cookie for implicit writeHead()
        if (!res._header) {
          res._implicitHeader();
        }

        req.session.resetMaxAge();

        req.session.save(function () {
          res.end(data, encoding);
        });

      }
      else {
        res.end(data, encoding);
      }
    };

    // .............................................................................
    // session functions
    // .............................................................................

    // session and cookie generator
    var createSession = function (err, sid, data, next) {
      if (err) {
        next(err);
        return;
      }

      debuglog("creating session object for '" + sid + "' and '" + JSON.stringify(data) + "'");

      var ck = new Cookie(cookie);

      if (data.cookie) {
        var expires = data.cookie.expires
          , orig = data.cookie.originalMaxAge;
        
        if ('string' == typeof expires) {
          ck.expires = new Date(expires);
        }

        ck.originalMaxAge = orig;
      }

      req.sessionID = sid;
      req.session = store.newSession(req, data);
      req.session.cookie = ck;

      next(null);
    };

    // session identifier generator (using the session store)
    var generateIdentifier = function (next) {
      debuglog("generating a new session identifier");

      store.generate(secret, fingerprint(req),
                     function (err, sid) {
                       if (err) {
                         console.log("error encountered while generating session: " + err);
                         next(err);
                       }
                       else {
                         debuglog("generated a new session identifier '" + sid + "'");
                         next(null, sid);
                       }
                     });
    };

    // creates an empty session (using the session store)
    var createEmptySessionData = function (sid, next) {
      debuglog("creating session data for sid '" + sid + "'");

      store.create(sid, 
                   function(err, data) {
                     if (err) {
                       console.log("error encountered while generating empty session data: " + err);
                       next(err);
                     }
                     else {
                       debuglog("generated empty session data for '" + sid + "'");
                       req.sessionID = sid;
                       next(null, data);
                     }
                   });
    };

    // generate a new session
    var generateNewSession = function (next) {
      generateIdentifier(function (err, sid) {
                           if (err) {
                             next(err);
                             return;
                           }

                           // create empty session data
                           createEmptySessionData(sid,
                                                  function (err, data) {
                                                    createSession(err, sid, data, next);
                                                  });
                         });
    };

    // load an existing session (using the session store)
    var loadExistingSession = function(sid, next) {
      debuglog("loading existing session data for '" + sid + "'");

      store.get(sid,
                function (err, data) {
                  if (err) {
                    debuglog("received an error while loading the session data: " + err);

                    if ('ENOENT' == err.code) {
                      debuglog("cannot load existing session data for '" + sid + "'");
                      generateNewSession(next);
                    }
                    else {
                      next(err);
                    }
                  }
                  else if (! data) {
                    debuglog("cannot load existing session data for '" + sid + "'");
                    generateNewSession(next);
                  }
                  else {
                    createSession(err, sid, data, next);
                  }
                });
    };

    // .............................................................................
    // create or load session
    // .............................................................................

    // get the sessionID from the cookie
    req.sessionID = req.cookies[key];

    // stop events until we are done
    var pause = utils.pause(req);

    // proxy to resume events
    var _next = next;

    next = function (err) {
      _next(err);
      pause.resume();
    }

    // create a new session if no is known
    if (! req.sessionID) {
      generateNewSession(next);
    }

    // load an existing session
    else {
      store.verify(req.sessionID, secret, fingerprint(req),
                   function (err, verified) {
                     if (err) {
                       next(err);
                       return;
                     }

                     if (verified) {
                       loadExistingSession(req.sessionID, next);
                     }
                     else {
                       debuglog("session identifier '" + req.sessionID + "' cannot be verified");
                       generateNewSession(next);
                     }
                   });
    }
  };
};
