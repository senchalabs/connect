
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var MemoryStore = require('./session/memory'),
    Session = require('./session/session'),
    utils = require('./../utils');

/**
 * Setup session store with the given `options`.
 *
 * Options:
 *
 *   - `store`         Session store instance
 *   - `fingerprint`   Custom fingerprint hashing function
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function session(options){
    options = options || {};
    var key = 'connect.sid';

    // Default memory store
    store = options.store || new MemoryStore;

    // Default fingerprint hashing function
    var hash = store.hash = options.fingerprint || function(req){
        return utils.md5(req.session.id
            + req.socket.remoteAddress
            + (req.headers['user-agent'] || ''));
    };

    return function session(req, res, next){
        // Expose store
        req.sessionStore = store;

        if (req.cookies) {
            // Commit session
            var writeHead = res.writeHead;
            res.writeHead = function(status, headers){
                headers = headers || {};
                res.writeHead = writeHead;
                store.set(req.sessionHash, req.session);
                store.cookie.expires = new Date(+new Date() + store.maxAge);
                headers['Set-Cookie'] = utils.serializeCookie(key, req.session.id, store.cookie);
                return res.writeHead(status, headers);
            };

            // Generates the new session
            function generate() {
                req.session = new Session(req, utils.uid());
                req.sessionHash = hash(req);
                next();
            }
            
            // We have an sid
            if (req.cookies[key]) {
                req.session = new Session(req, req.cookies[key]);
                req.sessionHash = hash(req);
                // See if the hash is valid
                store.get(req.sessionHash, function(err, sess){
                    if (err) {
                        next(err);
                    } else if (sess) {
                        // Valid; apply session data and update lastAccess
                        req.session = new Session(req, sess);
                        req.session.touch();
                        next();
                    } else {
                        // Invalid; generate
                        generate();
                    }
                });
            } else {
                // No sid; generate
                generate();
            }
        } else {
            next();
        }
    }
};