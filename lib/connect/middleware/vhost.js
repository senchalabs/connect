
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Setup vhost.
 */

module.exports = function(hostname, server){
    if (!hostname) {
        throw new Error('vhost hostname required');
    }
    if (!server) {
        throw new Error('vhost server required');
    }
    return function(req, res, next){
        var host = req.headers.host.split(':')[0];
        if (host === hostname) {
            server.handle(req, res);
        } else {
            next();
        }
    };
};