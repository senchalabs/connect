
/*!
 * Connect - cookieParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../utils')
  , cookie = require('cookie');

/**
 * Cookie parser:
 *
 * Parse _Cookie_ header and populate `req.cookies`
 * with an object keyed by the cookie names. Optionally
 * you may enabled signed cookie support by passing
 * a `secret` string, which assigns `req.secret` so
 * it may be used by other middleware.
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.cookieParser('optional secret string'))
 *       .use(function(req, res, next){
 *         res.end(JSON.stringify(req.cookies));
 *       })
 *
 * @param {String} secret
 * @return {Function}
 * @api public
 */

module.exports = function cookieParser(secret, errorHandler){
  if (typeof secret === 'function') {
    errorHandler = secret;
    secret = null;
  } else if (!errorHandler) {
    errorHandler = function noop() {};
  }

  return function cookieParser(req, res, next) {
    if (req.cookies) return next();

    req.secret = secret;

    req.__defineGetter__('cookies', function () {
      return req._cookies
        || parseCookies()
        || req._cookies;
    })

    req.__defineGetter__('signedCookies', function () {
      return req._signedCookies
        || parseCookies()
        || req._signedCookies;
    })

    next();

    function parseCookies() {
      var cookies = req.headers.cookie;

      req._cookies = {};
      req._signedCookies = {};

      if (cookies) {
        try {
          req._cookies = cookie.parse(cookies);
          if (secret) {
            req._signedCookies = utils.parseSignedCookies(req._cookies, secret);
            req._signedCookies = utils.parseJSONCookies(req._signedCookies);
          }
          req._cookies = utils.parseJSONCookies(req._cookies);
        } catch (err) {
          errorHandler(err);
        }
      }
    }
  };
};
