
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../utils');

/**
 * Provide `req.flash()`.
 *
 * @return {Function}
 * @api public
 */

module.exports = function flash(){
    return function flash(req, res, next) {

        /**
         * Queue flash `msg` of the given `type`.
         *
         * Examples:
         *
         *      req.flash('info', 'email sent');
         *      req.flash('error', 'email delivery failed');
         *      req.flash('info', 'email re-sent');
         *      // => 2
         *
         *      req.flash('info');
         *      // => ['email sent', 'email re-sent']
         *
         *      req.flash('info');
         *      // => []
         *
         *      req.flash();
         *      // => { error: ['email delivery failed'], info: [] }
         *
         * @param {String} type
         * @param {String} msg
         * @return {Array|Object|Number}
         * @api public
         */

        req.flash = function(type, msg){
            var msgs = this.session.flash = this.session.flash || {};
            if (type && msg) {
                msg = utils.miniMarkdown(utils.htmlEscape(msg));
                return (msgs[type] = msgs[type] || []).push(msg);
            } else if (type) {
                var arr = msgs[type];
                delete msgs[type];
                return arr || [];
            } else {
                this.session.flash = {};
                return msgs;
            }
        };

        next();
    };
};