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
}

/**
 * Log requests in common log format.
 */

exports.handle = function(req, res, next){
    var writeHead = res.writeHead,
        stream = this.stream,
        end = res.end,
        statusCode,
        resHeaders;

    // Proxy for statusCode

    res.writeHead = function(code, headers){
        statusCode = code;
        resHeaders = headers;
        return writeHead.call(res, code, headers);
    }

    // Proxy end to output a line to the provided logger

    res.end = function(){
        stream.write((req.socket && req.socket.remoteAddress)
         + ' - - [' + (new Date).toUTCString() + ']'
         + ' "' + req.method + ' ' + req.url.pathname
         + ' HTTP/' + req.httpVersionMajor + '.' + req.httpVersionMinor + '" '
         + statusCode + ' ' + (resHeaders['Content-Length'] || '-')
         + ' "' + (req.headers['referer'] || req.headers['referrer'] || '')
         + '" "' + (req.headers['user-agent'] || '') + '"\n');

        return end.apply(res, arguments);
    }

    next(req, res);
}