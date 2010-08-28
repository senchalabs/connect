
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    parse = require('url').parse
    utils = require('../utils'),
    path = require('path'),
    exec = require('child_process').exec;

module.exports = function staticGzip(options){
    var options = options || {},
        root = options.root,
        compress = options.compress;

    if (!root) throw new Error('staticGzip root must be set');
    if (!compress) throw new Error('staticGzip compress array must be passed');

    return function(req, res, next){
        var acceptEncoding = req.headers['accept-encoding'] || '';

        // Must Accept: gzip
        if (!~acceptEncoding.indexOf('gzip')) return next();

        // Parse the url
        var url = parse(req.url),
            filename = path.join(root, url.pathname),
            mime = utils.mime.type(filename).split(';')[0];

        // MIME type not white-listed
        if (!~compress.indexOf(mime)) return next();

        // Check if gzipped static is available
        var pause = utils.pause(req);
        gzipped(filename, function(err, path, ext){
            pause.end();
            if (err && err.errno === process.ENOENT) {
                next();
                pause.resume();
                if (err.path.indexOf('.gz')) {
                    gzip(filename, path);
                }
            } else if (err) {
                next(err);
            } else {
                // Re-write the url to serve the gzipped static
                req.url = url.pathname + ext;
                var writeHead = res.writeHead;
                res.writeHead = function(status, headers){
                    headers = headers || {};
                    res.writeHead = writeHead;
                    headers['Content-Type'] = mime;
                    headers['Content-Encoding'] = 'gzip';
                    res.writeHead(status, headers);
                };
                pause.resume();
                next();
            }
        });
    }
};

/**
 * Check for a gzipped version of the file at `path`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

function gzipped(path, fn) {
    fs.stat(path, function(err, stat){
        if (err) return fn(err);
        var ext = '.' + Number(stat.mtime) + '.gz';
        path += ext;
        fs.stat(path, function(err){
            fn(err, path, ext);
        });
    });
};

function gzip(src, dest) {
    // TODO: security for vars
    exec('gzip --best -c ' + src + ' > ' + dest);
}