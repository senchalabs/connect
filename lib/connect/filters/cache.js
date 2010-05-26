var Buffer = require('buffer').Buffer;
var sys = require('sys');

var cache = {};

module.exports = {
    handle: function (req, res, next, scope) {
        if (req.method !== "GET") {
            return next(req, res);
        }
        var origRes = res;
        res = Object.create(res);

        function serve() {
            var resp = cache[key];
            var headers = resp.headers;
            headers.Date = (new Date).toUTCString();
            origRes.writeHead(resp.code, headers);
            origRes.end(resp.body);
        }


        var key = req.method + "|" + req.url.pathname + req.headers["accept-encoding"];

        // Serve directly from the cache if there is a hit
        if (cache[key]) {
            
            // Check for If-Modified-Since headers to send 304 responses
            var headers = cache[key].headers;
            var since = Date.parse(req.headers["if-modified-since"]);
            if (since === Date.parse(headers["Last-Modified"])) {
                var newHeaders = {};
                Object.keys(headers).forEach(function (key) {
                   if (key.indexOf("Content") !== 0) {
                       newHeaders[key] = headers[key];
                   }
                });
                newHeaders.Date = (new Date).toUTCString();
                origRes.writeHead(304, newHeaders);
                origRes.end();
                return;
            }
            
            return serve();
        }

        // Proxy writeHead to get the status code and headers
        // also inject some cache related headers
        res.writeHead = function (code, headers) {
            cache[key] = {
                code: code,
                headers: headers
            };
        };

        // Store the chunks in memory so we can cache them
        var chunks = [];
        var total_size = 0;
        res.write = function (chunk, encoding) {
            if (typeof chunk === 'string') {
                var length;
                if (!encoding || encoding === 'utf8') {
                    length = Buffer.byteLength(chunk);
                }
                var b = new Buffer(length);
                b.write(chunk, encoding);
                chunks.push(b);
            } else {
                chunks.push(chunk);
            }
            total_size += chunk.length;
        }

        res.end = function (chunk, encoding) {
            if (chunk) {
                res.write(chunk, encoding);
            }

            var buffer = new Buffer(total_size);
            var offset = 0;
            chunks.forEach(function (chunk) {
                chunk.copy(buffer, offset);
                offset += chunk.length;
            });
            cache[key].body = buffer;
            var headers = cache[key].headers;
            if (scope.browserCache) {
                headers["Cache-Control"] = "public max-age=" + scope.browserCache;
            }
            if (scope.getMtime) {
                scope.getMtime(function (mtime) {
                    if (mtime) {
                        headers["Last-Modified"] = mtime.toUTCString();
                    }
                    serve();
                });
            } else {
                serve();
            }

            // Expire the ram cache after 100ms or the specified length
            setTimeout(function () {
                delete cache[key];
            }, scope.ramCache || 100);

        }

        next(req, res);
    }
}