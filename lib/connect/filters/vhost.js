
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Accepts a custom log stream, defaults to stdout.
 */

exports.setup = function(env){
    if (!this.hosts) {
        throw new Error('vhost requires hosts');
    }
};

/**
 * Route virtual hosts.
 */

exports.handle = function(req, res, next){
    var host = req.headers.host.split(':')[0];
    if (host in this.hosts) {
        this.hosts[host].handle(req, res);
    } else {
        next();
    }
};