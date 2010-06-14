
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    Store = require('./store').Store;

/**
 * Initialize CookieStore.
 *
 * @api public
 */

var CookieStore = exports.CookieStore = function CookieStore() {
    
};

sys.inherits(CookieStore, Store);
