
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
 * Expose staticGzip as the module.
 */

exports = module.exports = staticGzip;

/**
 * Gzip binary.
 * 
 * @type String
 */

exports.bin = 'gzip';

/**
 * Flags passed to gzip.
 * 
 * @type String
 */

exports.flags = '--best';

/**
 * staticGzip gzips statics via whitelist of mime types specified
 * by the `compress` option. Once created `staticProvider` can continue
 * on to serve the gzipped version of the file.
 *
 * Options:
 *
 *  - `root`      Root direction from which to generate gzipped statics
 *  - `compress`  Array of mime types serving as a whitelist
 *  - `flags`     String of flags passed to the binary
 *  - `bin`       Binary executable defaulting to "gzip"
 *
 * @param {Object} options
 * @api public
 */

function staticGzip(options){
    var options = options || {},
        root = options.root,
        compress = options.compress,
        flags = options.flags || exports.flags,
        bin = options.bin || exports.bin;

    if (!root) throw new Error('staticGzip root must be set');
    if (!compress) throw new Error('staticGzip compress array must be passed');

    return function(req, res, next){
        if (req.method !== 'GET') return next();

        var acceptEncoding = req.headers['accept-encoding'] || '';

        // Ignore when Accept-Encoding does not allow gzip
        if (acceptEncoding && !~acceptEncoding.indexOf('gzip')) return next();

        // Parse the url
        var url = parse(req.url),
            filename = path.join(root, url.pathname),
            mime = utils.mime.type(filename).split(';')[0];

        // MIME type not white-listed
        if (!~compress.indexOf(mime)) return next();

        // Check if gzipped static is available
        gzipped(filename, function(err, path, ext){
            if (err && err.errno === process.ENOENT) {
                next();
                // We were looking for a gzipped static,
                // so lets gzip it!
                if (err.path.indexOf('.gz') === err.path.length - 3) {
                    gzip(filename, path, flags, bin);
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
 * @param {String} flags
 * @param {String} bin
 * @api private
 */

function gzip(src, dest, flags, bin) {
    var cmd = bin + ' ' + flags + ' -c ' + src + ' > ' + dest; 
    exec(cmd, function(err, stdout, stderr){
        if (err) {
            console.error('\n' + err.stack);
            fs.unlink(dest);
        }
    });
};