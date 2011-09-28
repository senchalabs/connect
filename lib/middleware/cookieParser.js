
/*!
 * Connect - cookieParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../utils');

/**
 * Parse _Cookie_ header and populate `req.cookies`
 * with an object keyed by the cookie names.
 *
 * Examples:
 *
 *     connect.createServer(
 *         connect.cookieParser('keyboard cat')
 *       , function(req, res, next){
 *         res.end(JSON.stringify(req.cookies));
 *       }
 *     );
 *
 * @param {String} secret
 * @return {Function}
 * @api public
 */

module.exports = function cookieParser(secret){
  return function cookieParser(req, res, next) {
    var cookie = req.headers.cookie;
    if (req.cookies) return next();

    req.secret = secret;
    req.cookies = {};
    req.signedCookies = {};
    
    if (cookie) {
      try {
        req.cookies = utils.parseJSONCookies(utils.parseCookie(cookie));
        if (secret) {
          req.signedCookies = utils.parseSignedCookies(req.cookies, secret);
        }
      } catch (err) {
        return next(err);
      }
    }
    next();
  };
};