/*!
 * Connect - csrf
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils');
var uid = require('uid2');
var crypto = require('crypto');

/**
 * Anti CSRF:
 *
 * CSRF protection middleware.
 *
 * This middleware adds a `req.csrfToken()` function to make a token
 * which should be added to requests which mutate
 * state, within a hidden form field, query-string etc. This
 * token is validated against the visitor's session.
 *
 * The default `value` function checks `req.body` generated
 * by the `bodyParser()` middleware, `req.query` generated
 * by `query()`, and the "X-CSRF-Token" header field.
 *
 * This middleware requires session support, thus should be added
 * somewhere _below_ `session()` and `cookieParser()`.
 *
 * Options:
 *
 *    - `value` a function accepting the request, returning the token
 *
 * @param {Object} options
 * @api public
 */

module.exports = function csrf(options) {
  options = options || {};
  var value = options.value || defaultValue;

  return function(req, res, next){
    
    // generate secret if not present
    var secret = req.session._csrfSecret;
    if (secret) return createSalt(secret);

    uid(24, function(err, id){
      if (err) return next(err);
      req.session._csrfSecret = id;
      createSalt(id);
    });
    
    // generate salt for token
    function createSalt(secret) {
      uid(10, function(err, salt){
        if (err) return next(err);
        createToken(secret, salt);
      });
    }
    
    // generate the token
    function createToken(secret, salt) {
      var token;

      // lazy-load token
      req.csrfToken = function(){
        return token || (token = saltedToken(salt, secret));
      };
      
      // compatibility with old middleware
      delete req.session._csrf;
      Object.defineProperty(req.session, '_csrf', {
        get: function() {
          console.warn('req.session._csrf is deprecated, use req.csrfToken() instead');
          return req.csrfToken();
        }
      });
      
      // ignore these methods
      if ('GET' == req.method || 'HEAD' == req.method || 'OPTIONS' == req.method) return next();
      
      // determine user-submitted value
      var val = value(req);
      
      // check
      if (!checkToken(val, secret)) return next(utils.error(403));
      
      next();
    }
  }
};

/**
 * Default value function, checking the `req.body`
 * and `req.query` for the CSRF token.
 *
 * @param {IncomingMessage} req
 * @return {String}
 * @api private
 */

function defaultValue(req) {
  return (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
}

/**
 * Creates a CSRF token from a given salt and secret.
 *
 * @param {String} salt (should be 10 characters)
 * @param {String} secret
 * @return {String}
 * @api private
 */

function saltedToken(salt, secret) {
  return salt + crypto
    .createHash('sha1')
    .update(salt + secret)
    .digest('base64');
}

/**
 * Checks if a given CSRF token matches the given secret.
 *
 * @param {String} token
 * @param {String} secret
 * @return {Boolean}
 * @api private
 */

function checkToken(token, secret) {
  if ('string' != typeof token) return false;
  return token === saltedToken(token.slice(0, 10), secret);
}
