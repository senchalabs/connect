
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    Utils = require('../utils'),
    Url = require('url'),
    Path = require('path');

/**
 * Generate cache manifest for the given `root`, `networks`,
 * and `fallbacks`.
 *
 * @param {String} root
 * @param {Array} networks
 * @param {Array} fallbacks
 * @return {Function}
 * @api public
 */

module.exports = function cacheManifest(root, networks, fallbacks) {
    root = root || process.cwd();
    var suffix = "";

    // List of networks as an array of strings
    if (networks) {
        suffix += "\n\nNETWORK:\n" + networks.join("\n");
    }

    // List of fallbacks as key/value pairs
    if (fallbacks) {
        suffix += "\n\nFALLBACK:\n" +
            fallbacks.map(function (second, first) {
                return first + " " + second;
            }).join("\n");
    }

    return function cacheManifest(req, res, next) {
        if (Url.parse(req.url).pathname === "/cache.manifest") {
            Utils.find(root, (/./), function (err, files) {
                var latestMtime = 0;
                files = files.map(function (entry) {
                    if (entry.mtime > latestMtime) {
                        latestMtime = entry.mtime;
                    }
                    return entry.path.substr(1);
                });
                var manifest = "CACHE MANIFEST\n"
                    + "# " + latestMtime.toUTCString() + "\n"
                    + files.join("\n")
                    + suffix;

                res.writeHead(200, {
                    "Content-Type": "text/cache-manifest",
                    "Last-Modified": latestMtime.toUTCString(),
                    "Content-Length": manifest.length
                });
                res.end(manifest);
            });
            return;
        }
        next();
    };
};