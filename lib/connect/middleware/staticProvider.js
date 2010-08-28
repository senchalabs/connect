
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    Url = require('url'),
    Path = require('path'),
    utils = require('../utils'),
    Buffer = require('buffer').Buffer,
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
        if (req.method !== "GET") {
            next();
            return;
        }
        var url = Url.parse(req.url);

        var pathname = url.pathname.replace(/\.\.+/g, '.'),
            filename = Path.join(root, queryString.unescape(pathname));

        if (filename[filename.length - 1] === "/") {
            filename += "index.html";
        }

        // Buffer any events that fire while waiting on the stat.
        var pause = utils.pause(req);
        fs.stat(filename, function (err, stat) {
            pause.end();

            // Fall through for missing files, thow error for other problems
            if (err) {
                if (err.errno === process.ENOENT) {
                    pause.resume();
                    next();
                    return;
                }
                next(err);
                return;
            }

            // Serve the file directly using buffers
            function onRead(err, data) {
                if (err) {
                    next(err);
                    return;
                }

                // For older versions of node convert the string to a buffer.
                if (typeof data === 'string') {
                    var b = new Buffer(data.length);
                    b.write(data, "binary");
                    data = b;
                }

                // Zero length buffers act funny, use a string
                if (data.length === 0) {
                  data = "";
                }

                res.writeHead(200, {
                    "Content-Type": utils.mime.type(filename),
                    "Content-Length": data.length,
                    "Last-Modified": stat.mtime.toUTCString(),
                    "Cache-Control": "public max-age=" + maxAge
                });
                res.end(data);
            }

            // Node before 0.1.95 doesn't do buffers for fs.readFile
            if (process.version < "0.1.95" && process.version > "0.1.100") {
                // sys.debug("Warning: Old node version has slower static file loading");
                fs.readFile(filename, "binary", onRead);
            } else {
                fs.readFile(filename, onRead);
            }
        });
    };

};
