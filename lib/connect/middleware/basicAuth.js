
/*!
 * Connect - basicAuth
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Enfore basic authentication by providing a `callback(user, pass)`,
 * which must return `true` in order to gain access.
 *
 * Examples:
 *
 *     connect.createServer(
 *       connect.basicAuth(function(user, pass){
 *         return 'tj' == user & 'wahoo' == pass;
 *       })
 *     );
 *
 * @param {Function} callback
 * @param {String} realm
 * @api public
 */

module.exports = function basicAuth(callback, realm) {
  realm = realm || 'Authorization Required';

  function unauthorized(res) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="' + realm + '"');
    res.end('Unauthorized');
  }

  function badRequest(res) {
    res.statusCode = 400;
    res.end('Bad Request');
  }

  return function(req, res, next) {
    var authorization = req.headers.authorization;

    if (!authorization) return unauthorized(res);

    var parts = authorization.split(' ')
      , scheme = parts[0]
      , credentials = new Buffer(parts[1], 'base64').toString().split(':');

    if ('Basic' != scheme) return badRequest(res);

    if (callback(credentials[0], credentials[1])) {
      req.remoteUser = credentials[0];
      next();
    } else {
      unauthorized(res);
    }
  }
};

