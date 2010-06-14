
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Store = require('./session/store').Store,
    CookieStore = require('./session/cookie').CookieStore;

exports.setup = function(env){
    this.store = new (this.store || CookieStore);
    if (!(this.store instanceof Store)) {
        throw new Error('session "store" must be an instanceof the abstract Store.');
    }
};

exports.handle = function(req, res, next){
    require('sys').puts(require('sys').inspect(req.cookies));
    next();
};
