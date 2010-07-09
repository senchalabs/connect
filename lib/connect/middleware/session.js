
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var MemoryStore = require('./session/memory').MemoryStore,
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
    var fingerprint = options.fingerprint || function(req){
        return utils.md5(req.sessionId
            + req.socket.remoteAddress
            + (req.headers['user-agent'] || ''));
    };

    return function session(req, res, next){
        // Expose store
        req.sessionStore = store;

        if (req.cookies) {
            // Generates and stores the new session
            function generate() {
                req.sessionId = utils.uid();
                req.sessionHash = fingerprint(req);
                req.session = new Session(req);
                store.set(req.sessionHash, req.session, function(err){
                    next(err);
                });
            }
            
            // We have an sid
            if (req.cookies[key]) {
                req.sessionId = req.cookies[key];
                req.sessionHash = fingerprint(req);
                // See if the hash is valid
                store.get(req.sessionHash, function(err, sess){
                    if (err) {
                        next(err);
                    } else if (sess) {
                        // Valid; update lastAccess to,e
                        req.session = sess;
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

            // Commit session
            var writeHead = res.writeHead;
            res.writeHead = function(status, headers){
                headers = headers || {};
                res.writeHead = writeHead;
                store.set(req.sessionHash, req.session);
                // TODO: abstract
                store.cookie.expires = new Date(+new Date() + store.maxAge);
                headers['Set-Cookie'] = utils.serializeCookie(key, req.sessionId, store.cookie);
                return res.writeHead(status, headers);
            };
        } else {
            next();
        }
    }
};