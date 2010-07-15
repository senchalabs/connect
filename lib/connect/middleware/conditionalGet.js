
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Conditional GET request support.
 *
 * @return {Function}
 * @api public
 */

module.exports = function conditionalGet(){
    return function conditionalGet(req, res, next) {
        // Skip all requests that are not conditional gets.
        if (!(req.method === "GET" &&
             (req.headers["if-modified-since"] || req.headers["if-none-match"])
           )) {
            next();
            return;
        }

        var since = req.headers["if-modified-since"],
            oldEtag = req.headers["if-none-match"],
            writeHead = res.writeHead,
            write = res.write,
            end = res.end;

        since = since && Date.parse(since).valueOf();

        res.writeHead = function (code, headers) {
            var lastModified = headers["Last-Modified"],
                etag = headers["Etag"];
            lastModified = lastModified && Date.parse(lastModified).valueOf();

            // If there is no match, then move on.
            if (!(code === 200 &&
                  (lastModified === since || oldEtag === etag)
               )) {
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
    };
};