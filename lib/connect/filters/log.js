
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Accepts a custom log stream, defaults to stdout.
 */
exports.setup = function(env, customStream){
    this.stream = customStream || process.stdout;
};

/**
 * Log requests in common log format.
 */
exports.handle = function handle(err, req, res, next) {
    var stream = this.stream,
        statusCode,
        resHeaders,
        writeHead = res.writeHead,
        end = res.end;

    // Proxy for statusCode.
    res.writeHead = function(code, headers){
        res.writeHead = writeHead;
        res.writeHead(code, headers);
        
        statusCode = code;
        resHeaders = headers;
    };

    // Proxy end to output a line to the provided logger.
    res.end = function (chunk, encoding) {
        res.end = end;
        res.end(chunk, encoding);
        
        stream.write((req.socket && req.socket.remoteAddress)
         + ' - - [' + (new Date).toUTCString() + ']'
         + ' "' + req.method + ' ' + req.url
         + ' HTTP/' + req.httpVersionMajor + '.' + req.httpVersionMinor + '" '
         + statusCode + ' ' + (resHeaders['Content-Length'] || '-')
         + ' "' + (req.headers['referer'] || req.headers['referrer'] || '')
         + '" "' + (req.headers['user-agent'] || '') + '"\n', 'ascii');
    };

    // Fall through to the next layer.
    next();
};