
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http');
var resProto = http.ServerResponse.prototype;

/**
 * Respond with http status 500
 * and the given error as the body.
 *
 * @param  {Error} err
 * @api public
 */

resProto.error = function(err){
    this.writeHead(500, { 'Content-Type': 'text/plain' });
    this.end(err.toString());
};

/**
 * Respond with custom status code
 * and send the body as text.
 *
 * @param  {Number} code
 * @param  message
 * @api public
 */
resProto.simpleText = function (code, message) {
    this.writeHead(code, {
        "Content-Type": "text/plain",
        "Content-Length": message.length
    });
    this.end(message);
};
