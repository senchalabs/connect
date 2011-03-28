
/*!
 * Connect - basicAuth
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , unauthorized = utils.unauthorized
  , badRequest = utils.badRequest;

/**
 * Enfore basic authentication by providing a `callback(user, pass)`,
 * which must return `true` in order to gain access. Alternatively an async
 * method is provided as well, invoking `callback(user, pass, callback)`. Populates
 * `req.remoteUser`.
 *
 * Examples:
 *
 *     connect(
 *       connect.basicAuth(function(user, pass){
 *         return 'tj' == user & 'wahoo' == pass;
 *       })
 *     );
 *
 *     connect(
 *       connect.basicAuth(function(user, pass, fn){
 *         User.authenticate({ user: user, pass: pass }, fn);
 *       })
 *     );
 *
 * @param {Function} callback
 * @param {String} realm
 * @api public
 */

module.exports = function basicAuth(callback, realm) {
  realm = realm || 'Authorization Required';

  return function(req, res, next) {
    var authorization = req.headers.authorization;

    if (req.remoteUser) return next();
    if (!authorization) return unauthorized(res, realm);

    var parts = authorization.split(' ')
      , scheme = parts[0]
      , credentials = new Buffer(parts[1], 'base64').toString().split(':');

    if ('Basic' != scheme) return badRequest(res);

    // async
    if (callback.length >= 3) {
      var pause = utils.pause(req);
      callback(credentials[0], credentials[1], function(err, user){
        if (err || !user)  return unauthorized(res, realm);
        req.remoteUser = user;
        next();
        pause.resume();
      });
    // sync
    } else {
      if (callback(credentials[0], credentials[1])) {
        req.remoteUser = credentials[0];
        next();
      } else {
        unauthorized(res, realm);
      }
    }
  }
};

