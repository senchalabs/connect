
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var connect = require('./../index'),
    sys = require('sys');

/**
 * Output the given warning message.
 *
 * @param  {String} msg
 * @api private
 */

function warn(msg) {
    sys.error('Warning: ' + msg);
}

/**
 * Setup lint for the given `server`.
 *
 * @return {Function}
 * @api public
 */

module.exports = function lint(server){

    // Ensure a server is passed
    if (!server) {
        throw new Error('lint "server" must be passed.');
    }

    // Warn unless in development mode
    if (process.connectEnv.name !== 'development') {
        warn('"lint" middleware should never be enabled outside of the development environment');
    }

    // Check the stack
    checkStack(server.stack);

    // Do nothing
    return function(req, res, next){
        next();
    }
};

/**
 * Validate middleware in the stack.
 *
 * @param  {Array} stack
 * @api private
 */

function checkStack(stack) {
    var layers = [];
    stack.forEach(function(layer, i){
        if (layer.name !== 'lint') {
            var handle = layer.handle,
                handleParams = params(handle),
                handleBody = contents(handle);

            function warn(msg) {
                layers[i] = layer;
                sys.error('Warning: layer \x1B[1m' + layer.handle.name
                    + '\x1B[0m:' + i + ' '
                    + msg.replace(/\{(.*?)\}/g, '\x1B[1m$1\x1B[0m'));
            }

            // Param names

            if (handleParams[0] !== 'req' &&
                handleParams[0] !== 'request') {
                warn('First parameter should be named {req} or {request}, but is {' + handleParams[0] + '}');
            }
            if (handleParams[1] !== 'res' &&
                handleParams[1] !== 'response') {
                warn('Second parameter should be named {res} or {response}, but is {' + handleParams[1] + '}');
            }
            if (handleParams[2] !== 'next') {
                warn('Third parameter should be named {next}, but is {' + handleParams[2] + '}');
            }

            // Respond or call next()

            if (handleBody.indexOf('next(') === -1 &&
                handleBody.indexOf('writeHead') === -1) {
                warn('Does not seem to call {next()}, or respond to the request');
            }

            // Check for request headers gotcha

            if (/req(uest)?\.headers\[("|')[A-Z]/.test(handleBody)) {
                 warn('Request headers are {lowercased}, seems to be accessed with {capitals}');
            }
        }
    });

    // Output potentially problematic handlers
    layers.forEach(function(layer, i){
        var str = layer.handle.toString(),
            indents = str.match(/( *)\}$/)[1].length;
        str = str.replace(new RegExp('^ {0,' + indents + '}', 'gm'), '    ');
        sys.puts('\n' + i + ') \x1B[1m' + layer.handle.name + '\x1B[0m:', str);
    });
}

/**
 * Return the function body as a string.
 *
 * @param  {Function} fn
 * @return {String}
 * @api private
 */

function contents(fn){
    return fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
}

/**
 * Return array of function parameter names.
 *
 * @param  {Function} fn
 * @return {String}
 * @api private
 */

function params(fn){
    return fn.toString().match(/\((.*?)\)/)[1].match(/[\w]+/g) || [];
}