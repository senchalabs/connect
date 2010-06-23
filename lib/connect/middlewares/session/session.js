
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../../utils');

/**
 * Initialize Session with the given sid.
 *
 * @param {String} sid
 * @api public
 */
 
var Session = exports.Session = function Session(sid) {
    this.id = sid;
    this.touch();
};

/**
 * Update lastAccess timestamp.
 *
 * @api public
 */

Session.prototype.touch = function(){
    this.lastAccess = +new Date;
};
