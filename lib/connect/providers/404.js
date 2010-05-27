
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Accepts an optional 404 response message,
 * which defaults to 'Not Found'.
 */

exports.setup = function(env, customMessage){
    this.message = customMessage || 'Not Found';
}

/**
 * Respond with 404 response.
 */

exports.handle = function(req, res, next){
    res.writeHead(404, {
        'Content-Type': 'text/plain',
        'Content-Length': this.message.length
    });
    res.end(this.message);
}