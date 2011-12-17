
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
 * Setup session store with the given `options`.
 *
 * Session data is _not_ saved in the cookie itself, however
 * cookies are used, so we must use the [cookieParser()](middleware-cookieParser.html)
 * middleware _before_ `session()`.
 *
 * Examples:
 *
 *     connect.createServer(
 *         connect.cookieParser('keyboard cat')
 *       , connect.session({ key: 'sid' })
 *     );
 *
 * Options:
 *
 *   - `key` cookie name defaulting to `connect.sid`
 *   - `store` session store instance
 *   - `cookie` session cookie settings, defaulting to `{ path: '/', httpOnly: true, maxAge: 14400000 }`
 *   - `proxy` trust the reverse proxy when setting secure cookies (via "x-forwarded-proto")
 *
 * ## req.session
 *
 *  To store or access session data, simply use the request property `req.session`,
 *  which is (generally) serialized as JSON by the store, so nested objects 
 *  are typically fine. For example below is a user-specific view counter:
 *
 *       connect()
 *         .use(connect.favicon())
 *         .use(connect.cookieParser('keyboard cat'))
 *         .use(connect.session({ cookie: { maxAge: 60000 }}))
 *         .use(function(req, res, next){
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
 *       )).listen(3000);
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
 * ## Session#reload()
 *
 *  Reloads the session data.
 *
 *      req.session.reload(function(err){
 *        // session updated
 *      });
 *
 * ## Session#save()
 *
 *  Save the session.
 *
 *      req.session.save(function(err){
 *        // session saved
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
 * For an example implementation view the [connect-redis](http://github.com/visionmedia/connect-redis) repo.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

function session(options){
  var options = options || {}
    , key = options.key || 'connect.sid'
    , store = options.store || new MemoryStore
    , cookie = options.cookie
    , trustProxy = options.proxy;

  // notify user that this store is not
  // meant for a production environment
  if ('production' == env && store instanceof MemoryStore) {
    console.warn(warning);
  }

  // generates the new session
  store.generate = function(req){
    req.sessionID = utils.uid(24);
    req.session = new Session(req);
    req.session.cookie = new Cookie(req, cookie);
  };

  return function session(req, res, next) {
    // self-awareness
    if (req.session) return next();

    // ensure secret is available or bail
    if (!req.secret) throw new Error('connect.cookieParser("secret") required for security when using sessions');

    // parse url
    var url = parse(req.url)
      , path = url.pathname;

    // expose store
    req.sessionStore = store;

    // set-cookie
    res.on('header', function(){
      if (req.session) {
        var cookie = req.session.cookie;
        // only send secure session cookies when there is a secure connection.
        // proxySecure is a custom attribute to allow for a reverse proxy
        // to handle SSL connections and to communicate to connect over HTTP that
        // the incoming connection is secure.
        // TODO: x-forwarded-proto + reverse proxy mode
        var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase();
        var tls = req.connection.encrypted || (trustProxy && 'https' == proto);
        var secured = cookie.secure && tls;
        if (secured || !cookie.secure) {
          res.setHeader('Set-Cookie', cookie.serialize(key, req.sessionID));
        }
      }
    });

    // proxy end() to commit the session
    var end = res.end;
    res.end = function(data, encoding){
      res.end = end;
      if (!req.session) return res.end(data, encoding);
      if (!res.headerSent) res._implicitHeader();
      req.session.resetMaxAge();
      req.session.save(function(){
        res.end(data, encoding);
      });
    };

    // generate the session
    function generate() {
      store.generate(req);
    }

    // get the sessionID from the cookie
    req.sessionID = req.signedCookies[key];

    // make a new session if the browser doesn't send a sessionID
    if (!req.sessionID) {
      generate();
      next();
      return;
    }

    // generate the session object
    var pause = utils.pause(req);
    store.get(req.sessionID, function(err, sess){
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
        store.createSession(req, sess);
        next();
      }
    });
  };
};
