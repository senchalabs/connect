
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http'),
    Buffer = require('buffer').Buffer;
var resProto = http.ServerResponse.prototype;

/**
 * Respond with custom status code
 * if the message is a non-buffer object, send it as JSON
 * otherwise send it as text/plain.
 * defaultType can override the text/plain mime.
 *
 * @param  {Number} code
 * @param  message
 * @param  {String} defaultType
 * @api public
 */
resProto.simpleBody = function(code, message, defaultType) {
    var length;
    var encoding;
    var type = defaultType || "text/plain";
    if (typeof message === 'object' && !(message instanceof Buffer)) {
        message = JSON.stringify(message);
        type = "application/json";
    }
    length = message.length;
    if (typeof message === 'string') {
        length = Buffer.byteLength(message);
        encoding = "utf8";
    }
    this.writeHead(code, {
        "Content-Type": type,
        "Content-Length": length
    });
    this.end(message, encoding);
};
