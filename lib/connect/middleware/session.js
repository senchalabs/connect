
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var MemoryStore = require('./session/memory').MemoryStore,
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
    
    // Default memory store
    store = options.store || new MemoryStore;
    
    // Default fingerprint hashing function
    store.fingerprint = options.fingerprint || function(sid, req){
        return sid 
            + req.socket.remoteAddress
            + (req.headers['user-agent'] || '');
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
                // TODO: async? ...
                store.commit(req);
                // TODO: abstract
                store.cookie.expires = new Date(+new Date() + store.maxAge);
                headers['Set-Cookie'] = utils.serializeCookie(store.key, req.session.id, store.cookie);
                return res.writeHead(status, headers);
            };

            // Fetch session
            store.fetch(req, function(err, sess){
                req.session = sess || store.createSession();
                req.session.touch();
                next(err);
            });
        } else {
            next();
        }
    }
};