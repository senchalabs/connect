
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
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
resProto.simpleBody = function(code, message, extraHeaders) {
    var length;
    var encoding;
    var type = "text/plain; charset=utf8";
    if (typeof message === 'object' && !(message instanceof Buffer)) {
        message = JSON.stringify(message);
        type = "application/json; charset=utf8";
    }
    message = message || "";
    length = message.length;
    if (typeof message === 'string') {
        length = Buffer.byteLength(message);
        encoding = "utf8";
    }
    var headers = {
        "Content-Type": type,
        "Content-Length": length
    };
    if (extraHeaders) {
        if (typeof extraHeaders === 'string') {
            headers["Content-Type"] = extraHeaders;
        } else {
            extraHeaders.forEach(function (value, key) {
                headers[key] = value;
            });
        }
    }
    this.writeHead(code, headers);
    this.end(message, encoding);
};
