
/**
 * Module dependencies.
 */

require.paths.unshift(__dirname + '/../lib');

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

//
// 4. Syntax
//
var corsResponseHeaders = [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Expose-Headers',
    'Access-Control-Max-Age',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
];

var corsRequestHeaders = [
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
]

module.exports = {

    //
    // 5.1. Simple Cross-Origin Request, Actual Request, and Redirects
    //

    // 5.1.1: If the Origin header is not present terminate this set of steps.
    // The request is outside the scope of this specification.
    'test 5.1.1': function() {
        var server = helpers.run(
            connect.cors(),
            function(req, res, next) {
                assert.ok(true, 'Simple request');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Usual');
            }
        );
        server.assertResponse('GET', '/', 200, 'Usual');
        var req = server.request('GET', '/', { })
        req.addListener('response', function(res) {
            res.addListener('end', function() {
                corsResponseHeaders.forEach(function(header) {
                    assert.equal(typeof res.headers[header.toLowerCase()], 'undefined',
                              "Test no " + header + " response header if there is no Origin header in request");
                })
            })
        })
        req.end();
    },

    // 5.1.2: Split the value of the Origin header on the U+0020 SPACE character
    // and if any of the resulting tokens is not a case-sensitive match for any of
    // the values in list of origins do not set any additional headers and terminate
    // this set of steps.
    'test 5.1.2': function() {
        var server = helpers.run(
            connect.cors({
                '/': { origins: ['http://antono.info'] }
            }),
            function(req, res, next) {
                assert.ok(true, 'Simple request');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Usual');
            }
        );
        var req = server.request('GET', '/', { 'Origin': 'http://vova.info' })
        req.addListener('response', function(res) {
            res.addListener('end', function() {
                corsResponseHeaders.forEach(function(header) {
                    assert.equal(typeof res.headers[header.toLowerCase()], 'undefined',
                              "Test no " + header + " response header if origins not match");
                })
            })
        })
        req.end();
    },

    // 5.1.3: If the resource supports credentials add a single Access-Control-Allow-Origin header,
    // with the value of the Origin header as value, and add a single Access-Control-Allow-Credentials
    // header with the literal string "true" as value.
    'test 5.1.3': function() {
        var server = helpers.run(
            connect.cors({
                '/': {
                    origins: ['http://antono.info'],
                    credentails: true,
                }
            }),
            function(req, res, next) {
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('GET', '/', { 'Origin': 'http://antono.info' })
        req.addListener('response', function(res) {
            res.addListener('end', function() {
                assert.equal(res.headers['access-control-allow-origin'], 'http://antono.info',
                              "Test 'Access-Control-Allow-Origin' header if origin match");
                assert.equal(res.headers['access-control-allow-credentials'], 'true',
                              "Test 'Access-Control-Allow-Credentials' header if origin match");
            })
        })
        req.end();
    },

    // 5.1.4: If the resource wants to expose more than just simple response headers to the
    // API of the CORS API specification add one or more Access-Control-Expose-Headers
    // headers, with as values the filed names of the additional headers to expose.
    'test 5.1.4': function() { 
        var server = helpers.run(
            connect.cors({
                '/': {
                    origins: ['http://antono.info'],
                    headers: ['X-Hello-World', 'X-For-Antono'],
                }
            }),
            function(req, res, next) {
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('GET', '/', { 'Origin': 'http://antono.info' })
        req.addListener('response', function(res) {
            res.addListener('end', function() {
                assert.equal(res.headers['access-control-expose-headers'], 'X-Hello-World, X-For-Antono',
                             "Test 'Access-Control-Expose-Headers' header");
            })
        })
        req.end();
    },
}
