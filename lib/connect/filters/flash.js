
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Provide IncomingRequest#{flash,message}().
 */

exports.handle = function(req, res, next){
    var sess = req.session; 
    if (sess) {
        sess.flash = sess.flash || {};
        
        /**
         * Set flash message of the given type.
         *
         * Example:
         *
         *    req.flash('info', 'email sent');
         *    req.flash('error', 'email delivery failed');
         *    req.flash('info', 'email re-sent');
         *    // => 2
         *
         *    req.flash('info');
         *    // => ['email sent', 'email re-sent']
         *
         *    req.flash('info');
         *    // => []
         * 
         *    req.flash();
         *    // => { error: ['email delivery failed'], info: [] }
         *
         * @param {String} type
         * @param {String} msg
         * @return {Array|Object|Number}
         * @api public
         */
        
        req.flash = req.message = function(type, msg){
            if (type && msg) {
                return (sess.flash[type] = sess.flash[type] || []).push(msg);
            } else if (type) {
                var arr = sess.flash[type];
                delete sess.flash[type];
                return arr || [];
            } else {
                var obj = sess.flash;
                sess.flash = {};
                return obj;
            }
        };
    }
    next();
};