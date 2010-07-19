
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var Session = require('./session/session'),
    utils = require('./../utils');

/**
 * Setup session store with the given `options`.
 *
 * Options:
 *
 *   - `store`         Session store instance
 *   - `fingerprint`   Custom fingerprint generating function
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function sessionSetup(options){
    options = options || {};

    // The cookie key to store the session id in.
    var key = options.key || 'connect.sid';

    // Default memory store
    var store = options.store || new (require('./session/memory'));

    // Used to verify session ids / defaults to user agent
    var fingerprint = options.fingerprint || function fingerprint(req) {
        return req.headers['user-agent'] || '';
    };

    // This should be set by the app to make the session key tamper proof
    var secret = options.secret || "hackme";

    return function sessionHandle(req, res, next) {

        if (!req.cookies) {
            next(new Error("session requires cookieDecoder to work properly"));
            return;
        }

        // Wrap writeHead as a hook to save the session and send the cookie
        var writeHead = res.writeHead;
        res.writeHead = function(status, headers){

            // Update the session in the store if there is one
            if (req.session) {
                req.session.touch();
                store.set(req.sessionID, req.session);
            }

            // Send an updated cookie to the browser
            store.cookie.expires = new Date(Date.now() + store.maxAge);
            headers = headers || {};
            headers['Set-Cookie'] = utils.serializeCookie(key, req.sessionID, store.cookie);

            // Pass through the writeHead call
            res.writeHead = writeHead;
            return res.writeHead(status, headers);
        };

        // Calculates the security hash to prevent session hijacking
        // Uses information on the user-agent that created the session as it's fingerprint
        function hash(base) {
          return utils.md5(base + fingerprint(req) + secret);
        }

        // Generates the new session
        function generate() {
            var base = utils.uid();
            var sessionID = base + "." + hash(base);
            req.session = new Session(req, sessionID);
            req.sessionID = sessionID;
            next();
        }

        // Expose store
        req.sessionStore = store;

        // Get the sessionID from the cookie
        req.sessionID = req.cookies[key];

        // Make a new session if the browser doesn't send a sessionID
        if (!req.sessionID) {
            generate();
            return;
        }

        // Check the fingerprint
        var parts = req.sessionID.split('.');
        if (parts[1] !== hash(parts[0])) {
            // Make a new session if it doesn't check out
            generate();
            return;
        }

        // Generate the session object
        store.get(req.sessionID, function (err, sess) {
            // Error/missing handling
            if (err) {
                if (err.errno === process.ENOENT) {
                    // If the session ID is invalid, generate a new session
                    generate();
                } else {
                    // Otherwise pass the exception along
                    next(err);
                }
                return;
            }
            if (!sess) {
              // Some stores use a falsy result to signify no result
              generate();
              return;
            }

            // Load the session into the request
            req.session = new Session(req, sess);
            next();
        });
    };
};