/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    fs = require('fs');

/**
 * Accepts the follow options:
 *   - showStack       respond with both the error message and stack trace. Defaults to false
 *   - showMessage     respond with the exception message only. Defaults to false
 *   - dumpExceptions  dump exceptions to stderr (without terminating the process). Defaults to false
 */
 
exports.setup = function(env){};

/**
 * Handle exceptions caught.
 */
 
exports.handleError = function(err, req, res, next){
    if (this.dumpExceptions) {
        sys.error(err.stack);
    }
    if (this.showStack) {
        var accept = req.headers.accept || '';
        if (accept.indexOf('html') !== -1) {
            fs.readFile(__dirname + '/../public/style.css', function(e, style){
                style = style.toString('ascii');
                fs.readFile(__dirname + '/../public/error.html', function(e, html){
                    var stack = err.stack
                        .split('\n').slice(1)
                        .map(function(v){ return '<li>' + v + '</li>'; }).join('');
                    html = html
                        .toString('utf8')
                        .replace('{style}', style)
                        .replace('{stack}', stack)
                        .replace(/\{error\}/g, err.toString());
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end(html);
                });
            });
        } else if (accept.indexOf('json') !== -1) {
            var json = JSON.stringify({ error: err });
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(json);
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(err.stack);
        }
    } else {
        var body = this.showMessage
            ? err.toString()
            : 'Internal Server Error';
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(body);
    }
};