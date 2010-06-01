/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

var fs = require('fs'),
    sys = require('sys'),
    Url = require('url'),
    Path = require('path');

function rFind(path, callback) {
    var files = [];
    fs.readdir(path, function (err, paths) {
        if (err) {
            callback(err);
            return;
        }
        var counter = paths.length;
        function check() {
            counter--;
            if (counter === 0) {
                callback(null, files);
            }
        }
        paths.forEach(function (file) {
            var localPath = Path.join(path, file);
            fs.stat(localPath, function (err, stat) {
                if (err) {
                    callback(err);
                    return;
                }
                if (stat.isDirectory()) {
                    rfind(localPath, function (subfiles) {
                        files = files.concat(subFiles);
                        check();
                    });
                } else {
                    files.push({path: localPath, mtime: stat.mtime});
                    check();
                }
            });
        });
    });
    
}
var root;
module.exports = {
    
    setup: function (env) {
        root = this.root || process.cwd();
    },
    
    handle: function (err, req, res, next) {
        if (Url.parse(req.url).pathname === "/cache.manifest") {
            rFind(this.root, function (err, files) {
                if (err) {
                    next(err);
                    return;
                }
                var latestMtime = 0;
                files = files.map(function (entry) {
                    if (entry.mtime > latestMtime) {
                        latestMtime = entry.mtime;
                    }
                    return entry.path.substr(root.length);
                });
                var manifest = "CACHE MANIFEST\n"
                    + "# " + latestMtime.toUTCString() + "\n"
                    + files.join("\n");
                
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
    }
};