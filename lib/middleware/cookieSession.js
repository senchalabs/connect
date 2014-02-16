/*!
 * Connect - cookieSession
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../utils')
  , Cookie = require('./session/cookie')
  , debug = require('debug')('connect:cookieSession')
  , signature = require('cookie-signature')
  , crc32 = require('buffer-crc32')
  , url = require('url');

/**
 * Cookie Session:
 *
 *   Cookie session middleware.
 *
 *      var app = connect();
 *      app.use(connect.cookieParser());
 *      app.use(connect.cookieSession({ secret: 'tobo!', cookie: { maxAge: 60 * 60 * 1000 }}));
 *
 * Options:
 *
 *   - `key` cookie name defaulting to `connect.sess`
 *   - `secret` prevents cookie tampering
 *   - `cookie` session cookie settings, defaulting to `{ path: '/', httpOnly: true, maxAge: null }`
 *   - `proxy` trust the reverse proxy when setting secure cookies (via "x-forwarded-proto")
 *
 * Clearing sessions:
 *
 *  To clear the session call the `destroy` method,
 *  `cookieSession()` will then respond with a 1970 Set-Cookie.
 *  This matches the sessionStore api, so you can provide an sid
 *  (for consistancy purposes only, can be null) and a callback
 *  function.
 *
 *      req.session.destroy(null, function() {
 *        res.send('Session destroyed');
 *      });
 *
 * If you are interested in more sophisticated solutions,
 * you may be interested in:
 *
 *   - [client-sessions](https://github.com/mozilla/node-client-sessions)
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function cookieSession(options){
  // TODO: utilize Session/Cookie to unify API
  options = options || {};
  var key = options.key || 'connect.sess'
    , trustProxy = options.proxy;

  return function cookieSession(req, res, next) {
    var writeHead = res.writeHead;

    // req.secret is for backwards compatibility
    var secret = options.secret || req.secret;
    if (!secret) throw new Error('`secret` option required for cookie sessions');

    // default session
    req.session = {};
    var cookie = req.session.cookie = new Cookie(options.cookie);

    // pathname mismatch
    var originalPath = url.parse(req.originalUrl).pathname;
    if (0 != originalPath.indexOf(cookie.path)) return next();

    // cookieParser secret
    if (!options.secret && req.secret) {
      req.session = req.signedCookies[key] || {};
      req.session.cookie = cookie;
    } else {
      // TODO: refactor
      var rawCookie = req.cookies[key];
      if (rawCookie) {
        var unsigned = utils.parseSignedCookie(rawCookie, secret);
        if (unsigned) {
          var originalHash = crc32.signed(unsigned);
          req.session = utils.parseJSONCookie(unsigned) || {};
          req.session.cookie = cookie;
        }
      }
    }
    
    /**
     * Convenience destroy method
     *
     * @param {String} sid - Provided to match the sessionStore api
     * @param {Function} callback - The callback called after the session is deleted.
     * @api public
     */
     
    req.session.destroy = function deleteCookieSession(sid, callback) {
      req.session = null;
      callback && callback();
    }

    res.writeHead = function(){
      // removed
      if (!req.session) {
        debug('clear session');
        cookie.expires = new Date(0);
        res.setHeader('Set-Cookie', cookie.serialize(key, ''));
        return writeHead.apply(res, arguments);
      }

      delete req.session.cookie;

      // check security
      var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
        , tls = req.connection.encrypted || (trustProxy && 'https' == proto.split(/\s*,\s*/)[0]);

      // only send secure cookies via https
      if (cookie.secure && !tls) {
        debug('not secured');
        writeHead.apply(res, arguments);
        return
      }

      // serialize
      debug('serializing %j', req.session);
      var val = 'j:' + JSON.stringify(req.session);

      // compare hashes, no need to set-cookie if unchanged
      if (originalHash == crc32.signed(val)) {
        debug('unmodified session');
        writeHead.apply(res, arguments);
        return
      }

      // set-cookie
      val = 's:' + signature.sign(val, secret);
      val = cookie.serialize(key, val);
      debug('set-cookie %j', cookie);
      res.setHeader('Set-Cookie', val);
      writeHead.apply(res, arguments);
    };

    next();
  };
};
