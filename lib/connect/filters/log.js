/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

var stream;

/**
 * Accepts a custom log stream, defaults to stdout.
 */
exports.setup = function(env, customStream){
    stream = customStream || process.stdout;
}

/**
 * Log requests in common log format.
 */
exports.handle = function(req, res, next){
    var end = res.end;

    // Proxy end to output a line to the provided logger
    res.end = function () {

        stream.write((req.socket && req.socket.remoteAddress)
         + ' - - [' + (new Date).toUTCString() + ']'
         + ' "' + req.method + ' ' + req.url.pathname
         + ' HTTP/' + req.httpVersion + '" '
         + res.code + ' ' + (res.headers['Content-Length'] || '-')
         + ' "' + (req.headers['referer'] || req.headers['referrer'] || '')
         + '" "' + (req.headers['user-agent'] || '') + '"');

        return end.apply(res, arguments);
    }

    next(req, res);
}