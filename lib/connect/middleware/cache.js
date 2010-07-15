
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Buffer = require('buffer').Buffer;

/**
 * Cache in memory for the given `cacheDuration`.
 *
 * @param {Number} cacheDuration
 * @return {Function}
 * @api public
 */

module.exports = function cache(cacheDuration){
    var cache = {},
        queue = {};

    return function cache(req, res, next) {

        // Skip all requests that are not GET method
        if (req.method !== "GET") {
            next();
            return;
        }

        var key = req.headers["accept-encoding"] + req.url,
            writeHead = res.writeHead,
            write = res.write,
            end = res.end,
            code,
            headers,
            chunks = [],
            totalSize = 0;

        function serve() {
            var resp = cache[key];
            var headers = resp.headers;
            headers["Date"] = (new Date).toUTCString();
            headers["Content-Length"] = resp.body.length;

            if (localQueue) {
                // Send everyone in the wait queue the response.
                for (var i = 0, l = localQueue.length; i < l; i++) {
                    var localRes = localQueue[i];
                    localRes.writeHead(resp.code, headers);
                    localRes.end(resp.body);
                }
                // Kill the wait queue
                delete queue[key];
            } else {
                res.writeHead(resp.code, headers);
                res.end(resp.body);
            }

        }

        // If there is a cache-hit, serve it right away!
        if (cache[key]) {
            serve();
            return;
        }

        var localQueue = queue[key];
        if (localQueue) {
            localQueue[localQueue.length] = res;
            return;
        }
        localQueue = queue[key] = [res];

        // Defer the call to writeHead
        res.writeHead = function (setCode, setHeaders) {
            code = setCode;
            headers = setHeaders;
        };

        // Buffer the response body as an array of Buffer objects
        res.write = function (chunk, encoding) {
            if (typeof chunk === 'string') {
                var length;
                if (!encoding || encoding === 'utf8') {
                    length = Buffer.byteLength(chunk);
                }
                var buffer = new Buffer(length);
                buffer.write(chunk, encoding);
                chunks.push(buffer);
            } else {
                chunks.push(chunk);
            }
            totalSize += chunk.length;
        };

        res.end = function (chunk, encoding) {
            if (chunk) {
                res.write(chunk, encoding);
            }

            // Combine the buffer array into a single buffer
            var body = new Buffer(totalSize);
            var offset = 0;
            chunks.forEach(function (chunk) {
                chunk.copy(body, offset);
                offset += chunk.length;
            });

            // Store the result in the cache
            cache[key] = {
                body: body,
                code: code,
                headers: headers
            };

            // Put the original methods back in place
            res.writeHead = writeHead;
            res.write = write;
            res.end = end;

            // Serve the response from the cache
            serve();

            if (cacheDuration) {
                // Expire the ram cache after 100ms or the specified length
                setTimeout(function(){
                    delete cache[key];
                }, cacheDuration);
            } else {
                // When the timeout is zero, just kill it right away
                delete cache[key];
            }

        };

        next();
    };
};