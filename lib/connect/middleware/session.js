
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Session = require('./session/session')
  , utils = require('./../utils')
  , crypto = require('crypto');

/**
 * Setup session store with the given `options`.
 *
 * Options:
 *
 *   - `store`         Session store instance
 *   - `fingerprint`   Custom fingerprint generating function
 *   - `secret`        Secret string used to compute hash
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function sessionSetup(options){
    options = options || {};

    // The cookie key to store the session id in.
    var key = options.key || 'connect.sid';

    // Default memory store
    var store = options.store || new (require('./session/memory'));

    // Used to verify session ids / defaults to user agent
    var fingerprint = options.fingerprint || function fingerprint(req) {
        return req.headers['user-agent'] || '';
    };

    // Ensure secret is present
    if (!options.secret) {
      throw new Error('session() middleware requires the "secret" option string for security');
    }

    var secret = options.secret;

    return function sessionHandle(req, res, next) {
        var pause = utils.pause(req);

        // Wrap writeHead as a hook to save the session and send the cookie
        var writeHead = res.writeHead;
        res.writeHead = function(status, headers){

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
                if (headers['Set-Cookie']) {
                    headers['Set-Cookie'] += '\r\nSet-Cookie: ' + cookie;
                } else {
                    headers['Set-Cookie'] = cookie;
                }
            }

            // Pass through the writeHead call
            res.writeHead = writeHead;
            return res.writeHead(status, headers);
        };

        // commit sessions on end()
        var end = res.end;
        res.end = function(data, encoding){
          res.end = end;

          if (req.session) {
            req.session.touch();
            store.set(req.sessionID, req.session, function(){
              res.end(data, encoding);
            });
          } else {
            res.end(data, encoding);
          }
        };

        // Calculates the security hash to prevent session hijacking
        // Uses information on the user-agent that created the session as it's fingerprint
        function hash(base) {
          return crypto
            .createHmac('sha256', secret)
            .update(base + fingerprint(req))
            .digest('base64')
            .replace(/\+/g, ' ')
            .replace(/=*$/, '');
        }

        // Generates the new session
        var generate = store.generate = function(){
            var base = utils.uid(24);
            var sessionID = base + '.' + hash(base);
            req.sessionID = sessionID;
            req.session = new Session(req);
        };

        // Expose store
        req.sessionStore = store;

        // Get the sessionID from the cookie
        req.sessionID = req.cookies[key];

        // Make a new session if the browser doesn't send a sessionID
        if (!req.sessionID) {
            generate();
            next();
            return;
        }

        // Check the fingerprint
        var parts = req.sessionID.split('.');
        if (parts[1] !== hash(parts[0])) {
            // Make a new session if it doesn't check out
            generate();
            next();
            return;
        }

        // Generate the session object
        store.get(req.sessionID, function (err, sess) {
            pause.end();

            // Error/missing handling
            if (err) {
                if (err.errno === process.ENOENT) {
                    // If the session ID is invalid, generate a new session
                    generate();
                    next();
                } else {
                    // Otherwise pass the exception along
                    next(err);
                }
                pause.resume();
                return;
            }
            if (!sess) {
              // Some stores use a falsy result to signify no result
              generate();
              next();
              pause.resume();
              return;
            }

            // Load the session into the request
            req.session = new Session(req, sess);
            next();
            pause.resume();
        });
    };
};

/**
 * Expose constructors.
 */

exports.Session = Session;
exports.Store = require('./session/store');
exports.MemoryStore = require('./session/memory');
