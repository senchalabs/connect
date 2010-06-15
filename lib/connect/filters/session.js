
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Store = require('./session/store').Store,
    CookieStore = require('./session/cookie').CookieStore,
    utils = require('./../utils');


/**
 * Setup session store, defaulting to CookieStore.
 */

exports.setup = function(env){
    this.key = this.key || 'connect.session';
    this.store = this.store || new CookieStore();
    if (!(this.store instanceof Store)) {
        throw new Error('session "store" must be an instanceof the abstract Store.');
    }
};

/**
 * Handle session fetching / commiting for the give request.
 */

exports.handle = function(req, res, next){
    var store = this.store;
    
    if (req.cookies) {
        // Commit session
        var writeHead = res.writeHead;
        res.writeHead = function(status, headers){
            res.headers = res.headers || headers || {};
            res.writeHead = writeHead;
            store.commit(req, res);
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
