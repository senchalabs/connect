/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

// TODO: Implement etag support, shouldn't be hard, we just need a provider
// that actually provides them to test it.

module.exports = {
    
    handle: function (err, req, res, next) {

        // Skip all requests that are not conditional gets.
        if (!(req.method === "GET" && req.headers["if-modified-since"])) {
            next();
            return;
        }
        
        var since = Date.parse(req.headers["if-modified-since"]).valueOf(),
            writeHead = res.writeHead,
            write = res.write,
            end = res.end;

        res.writeHead = function (code, headers) {
            var lastModified = headers["Last-Modified"];
            lastModified = lastModified && Date.parse(lastModified).valueOf();

            // If there is no match, then move on.
            if (!(code === 200 && lastModified === since)) {
                res.writeHead = writeHead;
                res.writeHead(code, headers);
                return;
            }

            // Ignore writes
            res.write = function () {};
            
            res.end = function () {
                // Put the original functions back on.
                res.writeHead = writeHead;
                res.write = write;
                res.end = end;
                
                // Filter out any Content based headers since there is no
                // content.
                var newHeaders = {};
                headers.forEach(function (value, key) {
                    if (key.indexOf("Content") < 0) {
                        newHeaders[key] = value;
                    }
                });
                res.writeHead(304, newHeaders);
                res.end();
            };
        };

        next();
    }
};