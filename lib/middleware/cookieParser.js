
/*!
 * Connect - cookieParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var cookies = require('cookies');
var keygrip = require('keygrip');

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

module.exports = function cookieParser(keylist){
  var keys
  if (keylist) {
    if (!Array.isArray(keylist)) keylist = [keylist];
    keys = new keygrip(keylist);
  }

  return function cookieParser(req, res, next) {
    if (req.cookies) return next();
    req.cookies = res.cookies = new Cookies(req, res, keys);
    next();
  };
};
