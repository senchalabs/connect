
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
 * TODO: passing of settings to store... 
 */

exports.setup = function(env){
    this.store = new (this.store || CookieStore);
    if (!(this.store instanceof Store)) {
        throw new Error('session "store" must be an instanceof the abstract Store.');
    }
};

exports.handle = function(req, res, next){
    var store = this.store;
    
    // Proxy writeHead() to inject Set-Cookie
    // TODO: abstract out into CookieStore
    
    var writeHead = res.writeHead;
    res.writeHead = function(status, headers){
        res.headers = res.headers || headers || {};
        res.writeHead = writeHead;
        // TODO: detect session change
        // TODO: move base64 to cookie? ...
        // TODO: have node expose base64 ...
        store.commit(req, res);
        return res.writeHead(status, headers);
    };
    
    // Fetch session
    
    store.fetch(req, function(err, data){
        req.session = data || {};
        next(err);
    });
};
