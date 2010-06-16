
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Store = require('./session/store').Store,
    MemoryStore = require('./session/memory').MemoryStore,
    utils = require('./../utils');


/**
 * Setup session store:
 *
 *  - store         Session Store instance
 *  - fingerprint   Custom fingerprint hashing function
 */

exports.setup = function(env){
    // By default we use the MemoryStore
    this.store = this.store || new MemoryStore;
    
    // Ensure store is valid
    if (!(this.store instanceof Store)) {
        throw new Error('session "store" must be an instanceof the abstract Store.');
    }

    // Default fingerprint limits the session to a single User-Agent and remoteAddress
    this.store.fingerprint = this.fingerprint || function(sid, req){
        return sid 
            + req.socket.remoteAddress
            + (req.headers['user-agent'] || '');
    };
};

/**
 * Handle session fetching / commiting for the give request.
 */

exports.handle = function(req, res, next){
    var self = this,
        store = req.sessionStore = this.store;

    if (req.cookies) {
        // Commit session
        var writeHead = res.writeHead;
        res.writeHead = function(status, headers){
            res.headers = res.headers || headers || {};
            res.writeHead = writeHead;
            store.commit(req, res, req.session);
            // TODO: async? ...
            return res.writeHead(status, headers);
        };

        // Fetch session
        store.fetch(req, function(err, data){
            req.session = data || {};
            next(err);
        });
    } else {
        next();
    }
};
