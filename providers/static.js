
var fs = require('fs'),
    sys = require('sys'),
    Mime = require('./mime'),
    Path = require('path');

var root;
var lifetime = 1000 * 60 * 60; // 1 hour cache lifetime

module.exports = {

    setup: function (env, customPath) {
        root = customPath || process.cwd();
    },

    handle: function (req, res, next, scope) {
        var pathname = req.url.pathname.replace(/\.\.+/g, '.'),
            filename = Path.join(root, pathname);
        
        var origRes = res;
        res = Object.create(res);

        var mtime;

        if (filename[filename.length - 1] === "/") {
            filename += "index.html";
        }
        
        var eventQueue = [];
        function onData() {
            eventQueue.push(['data', Array.prototype.slice.call(arguments)]);
        }
        function onEnd() {
            eventQueue.push(['end', Array.prototype.slice.call(arguments)]);
        }
        req.addListener('data', onData);
        req.addListener('end', onEnd);
        
        // Hook for cache to get the mtime (used by the cache middleware)
        scope.getMtime = function (callback) {
            if (mtime) {
                callback(mtime);
                mtime = false;
                return;
            }
            fs.stat(filename, function (err, stat) {
                if (err) {
                    sys.error(err.stack);
                    return callback();
                }
                callback(stat.mtime);
                
            });
        };

        scope.ramCache = 1000 * 60 * 60; // Cache in ram for 1 hour (in ms)
        scope.browserCache = 60 * 60 * 24 * 365; // Cache in browser for 1 year

        fs.stat(filename, function (err, stat) {

            // Fall through for missing files, thow error for other problems
            if (err) {
                if (err.errno === process.ENOENT) {
                    req.removeListener("data", onData);
                    req.removeListener("end", onEnd);
                    next(req, origRes);
                    eventQueue.forEach(function (step) {
                        req.emit.apply(req, [step[0]].concat(step[1]));
                    }); 
                    return;
                }
                return res.error(err);
            }

            mtime = stat.mtime;

            // Serve the file directly using buffers
            fs.readFile(filename, function (err, data) {
                if (err) {
                    return res.error(err);
                }
                res.writeHead(200, {
                  "Content-Type": Mime.type(filename),
                  "Content-Length": data.length
                });
                res.end(data);
            });
        });
    }
}
