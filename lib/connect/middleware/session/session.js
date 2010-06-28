
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
 * Initialize Session with the given sid, or cast a session-like
 * object into a Session. This is useful when your data is serialized
 * and stuffed into a database.
 *
 * Examples:
 *
 *     new Session(123);
 *     Session({ id: 123, lastAccess: 4324394 });
 *
 * @param {String} sid
 * @api public
 */

var Session = exports.Session = function Session(sid) {
    if (this === global) {
        return utils.merge(new Session, sid);
    } else if (sid) {
        this.id = sid;
        this.touch();
    }
};

/**
 * Update lastAccess timestamp.
 *
 * @api public
 */

Session.prototype.touch = function(){
    this.lastAccess = +new Date;
};
