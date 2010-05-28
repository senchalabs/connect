
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys');

/**
 * Accepts the follow options:
 *   - showStack       respond with both the error message and stack trace. Defaults to false
 *   - showMessage     respond with the exception message only. Defaults to false
 *   - dumpExceptions  dump exceptions to stdout (without terminating the process). Defaults to false
 */
 
exports.setup = function(env, options){
    options = options || {};
    this.showStack = options.showStack || false;
    this.showMessage = options.showMessage || this.showStack || false;
    this.dumpExceptions = options.dumpExceptions || false;
};

/**
 * Exceptions caught or passed through the stack.
 */
 
exports.handle = function(err, req, res, next){
    if (err) {
        if (this.dumpExceptions) {
            sys.error(err.stack);
        }
        var body = this.showStack
            ? err.stack
            : this.showMessage
                ? err.toString()
                : 'Internal Server Error';
        res.writeHead(500, { 
            'Content-Type': 'text/plain',
            'Content-Length': body.length
        });
        res.end(body);
    } else {
        next();
    }
};