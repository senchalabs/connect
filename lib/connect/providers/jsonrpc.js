
/*!
 * Ext JS SS Library 0.0.1 
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    parse = require('url').parse,
    Buffer = require('buffer').Buffer,
    http = require('http');

/**
 * JSON-RPC version.
 */

var VERSION = exports.VERSION = '2.0';

/**
 * JSON parse error.
 */

var PARSE_ERROR = exports.PARSE_ERROR = -32700;

/**
 * Invalid request due to invalid or missing properties.
 */

var INVALID_REQUEST = exports.INVALID_REQUEST = -32600;

/**
 * Service method does not exist.
 */

var METHOD_NOT_FOUND = exports.METHOD_NOT_FOUND = -32601;

/**
 * Invalid parameters.
 */

var INVALID_PARAMS = exports.INVALID_PARAMS = -32602;

/**
 * Internal JSON-RPC error.
 */

var INTERNAL_ERROR = exports.INTERNAL_ERROR = -32603;

/**
 * Default error messages.
 */

var errorMessages = exports.errorMessages = {};
errorMessages[PARSE_ERROR] = 'Parse Error.';
errorMessages[INVALID_REQUEST] = 'Invalid Request.';
errorMessages[METHOD_NOT_FOUND] = 'Method Not Found.';
errorMessages[INVALID_PARAMS] = 'Invalid Params.';
errorMessages[INTERNAL_ERROR] = 'Internal Error.';

exports.setup = function(env, procedures, options){
    options = options || {};
    this.procedures = procedures || {};
};

exports.handle = function(err, req, res, next){
    var me = this,
        contentType = req.headers['content-type'] || '';
    if (!err && req.method === 'POST' && contentType === 'application/json') {
        var data = '';
        req.setEncoding('utf8');
        req.addListener('data', function(chunk) { data += chunk; });
        req.addListener('end', function() {
            // Attempt to parse request
            try {
                var rpc = JSON.parse(data),
                    batch = rpc instanceof Array;
            } catch (err) {
                return respond(normalize({ error: { code: PARSE_ERROR }}));
            }
            
            /**
             * Normalize response object.
             */
            
            function normalize(obj) {
                obj.id = obj.id || null;
                obj.jsonrpc = VERSION;
                if (obj.error && !obj.error.message) {
                    obj.error.message = errorMessages[obj.error.code];
                }
                return obj;
            }
            
            /**
             * Respond with the given response object.
             */
            
            function respond(obj) {
                var body = JSON.stringify(obj);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                });
                res.end(body);
            }
            
            // Handle requests
            
            if (batch) {
                var responses = [],
                    len = rpc.length,
                    pending = len;
                for (var i = 0; i < len; ++i) {
                    handleRequest.call(me, rpc[i], function(obj){
                        responses.push(normalize(obj));
                        if (!--pending) {
                            respond(responses);
                        }
                    });
                }
            } else {
                handleRequest.call(me, rpc, function(obj){
                    respond(normalize(obj));
                });
            }
        });
    } else {
        next();
    }
};

/**
 * Handle JSON-RPC request.
 *
 * @param  {Object} rpc
 * @param  {Function} respond
 * @api private
 */

function handleRequest(rpc, respond){
    try {
        if (validRequest(rpc)) {
            var method = this.procedures[rpc.method];
            if (typeof method === 'function') {
                var params = rpc.params || [];
                function reply(err, result){
                    if (err) {
                        if (typeof err === 'number') {
                            respond({
                                id: rpc.id,
                                error: {
                                    code: err
                                }
                            });
                        } else {
                            respond({
                                id: rpc.id,
                                error: {
                                    code: err.code || INTERNAL_ERROR,
                                    message: err.message
                                }
                            });
                        }
                    } else {
                        respond({
                            id: rpc.id,
                            result: result
                        });
                    }
                };
                method.apply(reply, params);
            } else {
                respond({ id: rpc.id, error: { code: METHOD_NOT_FOUND }});
            }
        } else {
            respond({ id: rpc.id, error: { code: INVALID_REQUEST }});
        }
    } catch (err) {
        respond({ id: rpc.id, error: { code: INTERNAL_ERROR }});
    }
}

/**
 * Check if the given request is a valid
 * JSON remote procedure call. 
 *
 *   - "jsonrpc" must match the supported version ('2.0')
 *   - "id" must be numeric
 *   - "method" must be a string
 *
 * @param  {Object} rpc
 * @return {Boolean}
 * @api private
 */

function validRequest(rpc){
    return rpc.jsonrpc === VERSION
        && typeof rpc.id === 'number'
        && typeof rpc.method === 'string';
}
