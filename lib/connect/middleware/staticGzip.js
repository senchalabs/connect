
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

/**
 * staticGzip gzips statics via whitelist of mime types specified
 * by the `compress` option. Once created `staticProvider` can continue
 * on to serve the gzipped version of the file.
 *
 * Options:
 *
 *  - `root`      Root direction from which to generate gzipped statics
 *  - `compress`  Array of mime types serving as a whitelist
 *
 * @param {Object} options
 * @api public
 */

module.exports = function staticGzip(options){
    var options = options || {},
        root = options.root,
        compress = options.compress;

    if (!root) throw new Error('staticGzip root must be set');
    if (!compress) throw new Error('staticGzip compress array must be passed');

    return function(req, res, next){
        var acceptEncoding = req.headers['accept-encoding'] || '';

        // Ignore when Accept-Encoding is not present, or does not allow gzip
        if (acceptEncoding && !~acceptEncoding.indexOf('gzip')) return next();

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

/**
 * Gzip `src` to `dest`.
 *
 * @param {String} src
 * @param {String} dest
 * @api private
 */

function gzip(src, dest) {
    exec('gzip --best -c ' + src + ' > ' + dest);
};