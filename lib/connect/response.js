
/*!
 * Ext JS Connect 0.0.1
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

/**
 * Wrap the given response method with
 * the function provided.
 *
 * @param  {String} method
 * @param  {Function} fn
 * @api public
 */

resProto.wrap = function(method, fn){
    var orig = this[method],
        me = this;
    me[method] = function(){
        fn.apply(me, arguments);
        return orig.apply(me, arguments);
    };
};