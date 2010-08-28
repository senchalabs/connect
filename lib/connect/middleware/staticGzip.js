
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

module.exports = function staticGzip(hostname, server){
    return function(req, res, next){
        var accept = req.headers.accept || '';
        // Must Accept: gzip
        if (!~accept.indexOf('gzip')) return next();
    }
};