
/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http');
var respProto = http.ServerResponse.prototype;

/**
 * Respond with http status 500
 * and the given error as the body.
 *
 * @param  {Error} err
 * @api public
 */

respProto.error = function(err){
    this.writeHead(500, { 'Content-Type': 'text/plain' });
    this.end(err.toString());
};
