
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
    Buffer = require('buffer').Buffer,
    Path = require('path'),
    queryString = require('querystring'),
    utils = require('./../utils');

/**
 * Browser cache lifetime of one hour.
 *
 * @type Number
 */

var lifetime = 1000 * 60 * 60;

/**
 * Static file server.
 *
 * Options:
 *
 *   - `root`    Root path from which to serve static files.
 *
 * @param {String} root
 * @return {Function}
 * @api public
 */

module.exports = function staticProvider(root){
    root = process.connectEnv.staticRoot || root || process.cwd();
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
        var events = [];
        function onData() {
            events.push(["data"].concat(toArray(arguments)));
        }
        function onEnd() {
            events.push(["end"].concat(toArray(arguments)));
        }
        req.addListener("data", onData);
        req.addListener("end", onEnd);

        fs.stat(filename, function (err, stat) {

            // Stop buffering events
            req.removeListener("data", onData);
            req.removeListener("end", onEnd);

            // Fall through for missing files, thow error for other problems
            if (err) {
                if (err.errno === process.ENOENT) {
                    next();
                    // Refire the buffered events
                    for (var i = 0, len = events.length; i < len; ++i) {
                        req.emit.apply(req, events[i]);
                    }
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
                    // Cache in browser for 1 year
                    "Cache-Control": "public max-age=" + 31536000
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

/**
 * Convert array-like object to an Array.
 *
 * node-bench: "16.5 times faster than Array.prototype.slice.call()"
 *
 * @param {Object} obj
 * @return {Array}
 * @api private
 */

function toArray(obj){
    var len = obj.length,
        arr = new Array(len);
    for (var i = 0; i < len; ++i) {
        arr[i] = obj[i];
    }
    return arr;
}