
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Setup vhost for the given `hostname` and `server`.
 *
 * Examples:
 *
 *     connect.createServer(
 *       connect.vhost('foo.com',
 *          connect.createServer(...middleware...)
 *      ),
 *       connect.vhost('bar.com',
 *           connect.createServer(...middleware...)
 *       )
 *     );
 *
 * @param {String} hostname
 * @param {Server} server
 * @return {Function}
 * @api public
 */

module.exports = function vhost(hostname, server){
    if (!hostname) {
        throw new Error('vhost hostname required');
    }
    if (!server) {
        throw new Error('vhost server required');
    }
    return function vhost(req, res, next){
        var host = req.headers.host.split(':')[0];
        if (host === hostname) {
            server.handle(req, res);
        } else {
            next();
        }
    };
};