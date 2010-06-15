
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Bounce favicon.ico, responding with 404 immediately.
 */

exports.handle = function(req, res, next){
    if (req.url === '/favicon.ico') {
        res.writeHead(404, { 'Content-Length': 0 });
        res.end();
    } else {
        next();
    }
};