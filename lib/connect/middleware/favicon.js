
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    utils = require('../utils');

/**
 * Favicon cache.
 * 
 * @type Object
 */

var icon;

/**
 * By default serves the connect favicon, or the favicon
 * located by the given path.
 *
 * Examples:
 *
 *     connect.createServer(
 *         connect.favicon()    
 *     );
 *
 *     connect.createServer(
 *         connect.favicon(__dirname + '/public/favicon.ico')    
 *     );
 *
 * @param {String} path
 * @return {Function}
 * @api public
 */

module.exports = function favicon(path){
    path = path || __dirname + '/../public/favicon.ico';
    return function favicon(req, res, next){
        if (req.url === '/favicon.ico') {
            if (icon) {
                res.writeHead(200, icon.headers);
                res.end(icon.body);
            } else {
                fs.readFile(path, function(err, buf){
                    if (err) return next(err);
                    icon = {
                        headers: {
                            'Content-Type': 'image/x-icon',
                            'Content-Length': buf.length,
                            'ETag': utils.md5(buf),
                            'Cache-Control': 'public max-age=3600'
                        },
                        body: buf
                    }
                    res.writeHead(200, icon.headers);
                    res.end(icon.body);
                });
            }
        } else {
            next();
        }
    };
};