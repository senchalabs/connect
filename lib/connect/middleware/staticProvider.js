
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    Path = require('path'),
    utils = require('../utils'),
    Buffer = require('buffer').Buffer,
    parseUrl = require('url').parse,
    queryString = require('querystring');

/**
 * Default browser cache maxAge of one year.
 */

const MAX_AGE = 31536000;

/**
 * Static file server.
 *
 * Options:
 *
 *   - `root`     Root path from which to serve static files.
 *   - `maxAge` Browser cache maxAge
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function staticProvider(options){
    var maxAge,
        root;

    // Support options object and root string
    if (typeof options == 'string') {
        root = options;
        maxAge = MAX_AGE;
    } else {
        options = options || {};
        maxAge = options.maxAge === undefined
            ? MAX_AGE
            : options.maxAge;
        root = process.connectEnv.staticRoot || options.root || process.cwd();
    }

    return function staticProvider(req, res, next) {
        if (req.method !== 'GET') return next();

        var url = parseUrl(req.url),
            pathname = url.pathname.replace(/\.\.+/g, '.'),
            filename = Path.join(root, queryString.unescape(pathname));

        if (filename[filename.length - 1] === '/') {
            filename += "index.html";
        }

        fs.stat(filename, function(err, stat){

            // Pass through for missing files, thow error for other problems
            if (err) {
                return err.errno === process.ENOENT
                    ? next()
                    : next(err);
            } else if (stat.isDirectory()) {
                return next();
            }

            var responseCode = 200,
                responseHeaders = {
                    "Content-Type": utils.mime.type(filename),
                    "Content-Length": stat.size,
                    "Last-Modified": stat.mtime.toUTCString(),
                    "Cache-Control": "public max-age=" + maxAge
                }, readOpts = {};

            // If the client requested a "Range", then prepare the headers
            // and set the read stream options to read the specified range.
            if (req.headers['range']) {
                var range = req.headers['range'].substring(6).split('-');
                readOpts.start = Number(range[0]);
                readOpts.end = Number(range[1]);
                if (range[1].length === 0) {
                    readOpts.end = stat.size - 1;
                } else if (range[0].length === 0) {
                    readOpts.end = stat.size - 1;
                    readOpts.start = readOpts.end - range[1] + 1;
                }
                responseCode = 206;
                responseHeaders['Accept-Ranges'] = "bytes";
                responseHeaders['Content-Length'] = readOpts.end - readOpts.start + 1;
                responseHeaders['Content-Range'] = "bytes " + readOpts.start + "-" + readOpts.end + "/" + stat.size;
            }

            // Stream the file
            res.writeHead(responseCode, responseHeaders);
            var readStream = fs.createReadStream(filename, readOpts);
            readStream.addListener('error', function(error) {
                next(error);
            });
            readStream.on('data', function(data) {
                if (!res.write(data)) {
                    readStream.pause();
                }
            });
            res.on('drain', function() {
                readStream.resume();
            });
            readStream.on('end', function() {
                res.end();
            });
        });
    };

};
