var stream;

module.exports = {
    
    // Default to sys.debug, but allow it to be overridden
    setup: function (env, customStream) {
        stream = customStream || process.stdout;
    },

    handle: function(req, res, next) {
    
        // Proxy writeHead to get the status Code out of it
        var writeHead = res.writeHead;
        var statusCode;
        var resHeaders;
        res.writeHead = function (code, headers) {
            statusCode = code;
            resHeaders = headers;
            return writeHead.call(res, code, headers);
        };

        // Proxy end to output a line to the provided logger
        var end = res.end;
        res.end = function () {
            // Common Log Format (mostly)
            stream.write((req.socket && req.socket.remoteAddress)
             + " - - [" + (new Date).toUTCString() + "]" 
             + " \"" + req.method + " " + req.url.pathname
             + " HTTP/" + req.httpVersionMajor + "." + req.httpVersionMinor + "\" "
             + statusCode + " " + (resHeaders["Content-Length"] || "-") + " \""
             + (req.headers['referer'] || "") + "\" \"" 
             + (req.headers["user-agent"] ? req.headers["user-agent"] : '') + "\"");

            return end.apply(res, arguments);
        };
    
        // Punt to the next item in the chain
        next(req, res);
    }

};
