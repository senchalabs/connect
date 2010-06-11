
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Accepts a custom log stream, defaults to stdout.
 */

exports.setup = function(env){
    this.format = env.logFormat || this.format;
    this.stream = this.stream || process.stdout;
};

/**
 * Log requests in common log format.
 */

exports.handle = function handle(req, res, next) {
    var stream = this.stream,
        start = +new Date,
        statusCode,
        resHeaders,
        writeHead = res.writeHead,
        end = res.end,
        url = req.url;

    // Proxy for statusCode.
    res.writeHead = function(code, headers){
        res.writeHead = writeHead;
        res.writeHead(code, headers);
        res.statusCode = statusCode = code;
        res.headers = resHeaders = headers;
    };

    // Proxy end to output a line to the provided logger.
    if (this.format) {
        var fmt = this.format;
        res.end = function(chunk, encoding) {
            res.end = end;
            res.end(chunk, encoding);
            res.responseTime = +new Date - start;
            stream.write(format(fmt, req, res) + '\n', 'ascii');
        };
    } else {
        res.end = function(chunk, encoding) {
            res.end = end;
            res.end(chunk, encoding);
        
            stream.write((req.socket && req.socket.remoteAddress)
             + ' - - [' + (new Date).toUTCString() + ']'
             + ' "' + req.method + ' ' + url
             + ' HTTP/' + req.httpVersionMajor + '.' + req.httpVersionMinor + '" '
             + statusCode + ' ' + (resHeaders['Content-Length'] || '-')
             + ' "' + (req.headers['referer'] || req.headers['referrer'] || '')
             + '" "' + (req.headers['user-agent'] || '') + '"\n', 'ascii');
        };
    }

    // Fall through to the next layer.
    next();
};

/**
 * Return formatted log line.
 *
 * Tokens:
 * 
 *   - :req[header]
 *   - :res[header]
 *   - :http-version
 *   - :response-time
 *   - :remote-addr
 *   - :date
 *   - :method
 *   - :url
 *   - :referrer
 *   - :user-agent
 *   - :status
 *
 * TODO: support http://www.w3.org/TR/WD-logfile.html
 *
 * @param  {String} str
 * @param  {IncomingMessage} req
 * @param  {ServerResponse} res
 * @return {String}
 * @api private
 */

function format(str, req, res) {
    return str
        .replace(':url', req.url)
        .replace(':method', req.method)
        .replace(':status', res.statusCode)
        .replace(':response-time', res.responseTime)
        .replace(':date', new Date().toUTCString())
        .replace(':referrer', req.headers['referer'] || req.headers['referrer'] || '')
        .replace(':http-version', req.httpVersionMajor + '.' + req.httpVersionMinor)
        .replace(':remote-addr', req.socket && req.socket.remoteAddress)
        .replace(':user-agent', req.headers['user-agent'] || '')
        .replace(/:req\[([^\]]+)\]/g, function(_, header){ return req.headers[header]; })
        .replace(/:res\[([^\]]+)\]/g, function(_, header){ return res.headers[header]; });
};