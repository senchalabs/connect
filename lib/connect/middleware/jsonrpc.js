
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    parse = require('url').parse,
    Buffer = require('buffer').Buffer,
    http = require('http');

/**
 * Export the `setup()` function.
 */

exports = module.exports = jsonrpc;

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

/**
 * Accepts any number of objects, exposing their methods.
 *
 * @param {Object} ...
 * @return {Function}
 * @api public
 */

function jsonrpc(services) {
    services = services || {};

    // Merge methods
    for (var i = 0, len = arguments.length; i < len; ++i) {
        arguments[i].forEach(function(val, key){
            services[key] = val;
        });
    }

    /**
     * Handle JSON-RPC request.
     *
     * @param  {Object} rpc
     * @param  {Function} respond
     */

    function handleRequest(rpc, respond){
        if (validRequest(rpc)) {
            var method = services[rpc.method];
            if (typeof method === 'function') {
                var params = [];
                if (rpc.params instanceof Array) {
                    params = rpc.params;
                } else if (typeof rpc.params === 'object') {
                    var names = method.toString().match(/\((.*?)\)/)[1].match(/[\w]+/g);
                    if (names) {
                        for (var i = 0, len = names.length; i < len; ++i) {
                            params.push(rpc.params[names[i]]);
                        }
                    } else {
                        // Function does not have named parameters
                        return respond({ error: { code: INVALID_PARAMS, message: 'This service does not support named parameters.' }});
                    }
                }
                function reply(err, result){
                    if (err) {
                        if (typeof err === 'number') {
                            respond({
                                error: {
                                    code: err
                                }
                            });
                        } else {
                            respond({
                                error: {
                                    code: err.code || INTERNAL_ERROR,
                                    message: err.message
                                }
                            });
                        }
                    } else {
                        respond({
                            result: result
                        });
                    }
                }
                method.apply(reply, params);
            } else {
                respond({ error: { code: METHOD_NOT_FOUND }});
            }
        } else {
            respond({ error: { code: INVALID_REQUEST }});
        }
    }

    return function jsonrpc(req, res, next) {
        var me = this,
            contentType = req.headers['content-type'] || '';
        if (req.method === 'POST' && contentType.indexOf('application/json') >= 0) {
            var data = '';
            req.setEncoding('utf8');
            req.addListener('data', function(chunk) { data += chunk; });
            req.addListener('end', function() {

                // Attempt to parse incoming JSON string

                try {
                    var rpc = JSON.parse(data),
                        batch = rpc instanceof Array;
                } catch (err) {
                    return respond(normalize(rpc, { error: { code: PARSE_ERROR }}));
                }

                /**
                 * Normalize response object.
                 */

                function normalize(rpc, obj) {
                    obj.id = rpc && typeof rpc.id === 'number'
                        ? rpc.id
                        : null;
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
                        (function(rpc){
                            handleRequest.call(me, rpc, function(obj){
                                responses.push(normalize(rpc, obj));
                                if (!--pending) {
                                    respond(responses);
                                }
                            });
                        })(rpc[i]);
                    }
                } else {
                    handleRequest.call(me, rpc, function(obj){
                        respond(normalize(rpc, obj));
                    });
                }
            });
        } else {
            next();
        }
    };
};

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
