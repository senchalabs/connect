
/*!
 * Ext JS SS Library 0.0.1 
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse,
    Buffer = require('buffer').Buffer,
    http = require('http');

/**
 * JSON-RPC version.
 */

var VERSION = exports.VERSION = '2.0';

/**
 * JSON parse error.
 */

var PARSE_ERROR = exports.PARSE_ERROR = -32700

/**
 * Invalid request due to invalid or missing properties.
 */

var INVALID_REQUEST = exports.INVALID_REQUEST = -32600

/**
 * Service method does not exist.
 */

var METHOD_NOT_FOUND = exports.METHOD_NOT_FOUND = -32601

/**
 * Invalid parameters.
 */

var INVALID_PARAMS = exports.INVALID_PARAMS = -32602

/**
 * Internal JSON-RPC error.
 */

var INTERNAL_ERROR = exports.INTERNAL_ERROR = -32603

/**
 * Default error messages.
 */

var errorMessages = exports.errorMessages = {}
errorMessages[PARSE_ERROR] = 'Parse Error.'
errorMessages[INVALID_REQUEST] = 'Invalid Request.'
errorMessages[METHOD_NOT_FOUND] = 'Method Not Found.'
errorMessages[INVALID_PARAMS] = 'Invalid Params.'
errorMessages[INTERNAL_ERROR] = 'Internal Error.'

exports.setup = function(env, procedures){
    this.procedures = procedures || {};
}

exports.handle = function(err, req, res, next){
    var contentType = req.headers['content-type'] || '';
    if (!err && req.method === 'POST' && contentType === 'application/json') {
        var data = '';
        req.setEncoding('utf8');
        req.addListener('data', function(chunk) { data += chunk; });
        req.addListener('end', function() {
            req.rawBody = data;
            try {
                req.body = JSON.parse(data);
                if (validRequest(req)) {
                    
                } else {
                    respond(res, { error: { code: INVALID_REQUEST }});
                }
            } catch (err) {
                respond(res, { error: { code: PARSE_ERROR }});
            }
        });
    } else {
        next();
    }
};

function validRequest(req){
    return req.body.jsonrpc === VERSION && typeof req.body.id === 'number';
}

function respond(res, obj){
    obj.id = obj.id || null;
    obj.jsonrpc = VERSION;
    if (obj.error && !obj.error.message) {
        obj.error.message = errorMessages[obj.error.code];
    }
    var body = JSON.stringify(obj);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    })
    res.end(body);
};