
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Accepts an error-hand
 */
 
exports.setup = function(env, options){
    options = options || {};
    this.showStack = options.showStack || false;
    this.showMessage = options.showMessage || this.showStack || false;
};

/**
 * Exceptions caught or passed through the stack.
 */
 
exports.handle = function(err, req, res, next){
    if (err) {
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