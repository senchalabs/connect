
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

/**
 * Path to ./test/fixtures/
 */

var fixturesPath = __dirname + '/fixtures';

module.exports = {
    'test routing': function(){
        var server = helpers.run([
            { provider: 'rest', routes: {
                post: {
                    '/': function(req, res){
                        res.writeHead(200, {});
                        res.end('POST /');
                    }
                },
                put: {
                    '/': function(req, res){
                        res.writeHead(200, {});
                        res.end('PUT /');
                    }
                },
                del: {
                    '/': function(req, res){
                        res.writeHead(200, {});
                        res.end('DELETE /');
                    }
                },
                get: {
                    '/': function(req, res){
                        res.writeHead(200, {});
                        res.end('GET /');
                    },
                    '/public/*': function(req, res, params){
                        res.writeHead(200, {});
                        res.end('splat "' + params.splat[0] + '"');
                    },
                    '/user/:id': function(req, res, params){
                        res.writeHead(200, {});
                        res.end('got user ' + params.id);
                    },
                    '/user/:id/:operation': function(req, res, params){
                        res.writeHead(200, {});
                        res.end(params.operation + 'ing user ' + params.id);
                    },
                    '/range/:from-:to?': function(req, res, params){
                        res.writeHead(200, {});
                        res.end('range ' + params.from + ' to ' + (params.to || 'HEAD'));
                    },
                    '/users.:format': function(req, res, params){
                        res.writeHead(200, {});
                        res.end(params.format + ' format');
                    },
                    '/cookies.:format?': function(req, res, params){
                        var cookies = ['num', 'num'];
                        res.writeHead(200, {});
                        switch (params.format) {
                            case 'json':
                                res.end(JSON.stringify(cookies));
                                break;
                            default:
                                res.end(cookies.join(' '));
                        }
                    }
                }
            }}
        ]);
        server.assertResponse('GET', '/', 200, 'GET /', 'Test rest GET /');
        server.assertResponse('POST', '/', 200, 'POST /', 'Test rest POST /');
        server.assertResponse('PUT', '/', 200, 'PUT /', 'Test rest PUT /');
        server.assertResponse('DELETE', '/', 200, 'DELETE /', 'Test rest DELETE /');
        server.assertResponse('GET', '/user', 404, 'Cannot find /user', 'Test rest GET unmatched path param');
        server.assertResponse('GET', '/user/12', 200, 'got user 12', 'Test rest GET matched path param');
        server.assertResponse('GET', '/user/12/', 200, 'got user 12', 'Test rest GET matched path param with trailing slash');
        server.assertResponse('GET', '/user/99/edit', 200, 'editing user 99', 'Test rest GET matched path with several params');
        server.assertResponse('GET', '/range/11-99', 200, 'range 11 to 99');
        server.assertResponse('GET', '/range/11-', 200, 'range 11 to HEAD');
        server.assertResponse('GET', '/users.json', 200, 'json format');
        server.assertResponse('GET', '/cookies', 200, 'num num', 'Test rest optional placeholder without value');
        server.assertResponse('GET', '/cookies.json', 200, '["num","num"]', 'Test reset optional placeholder with value');
        server.assertResponse('GET', '/public', 404, 'Cannot find /public', 'Test required splat without value');
        server.assertResponse('GET', '/public/jquery.js', 200, 'splat "jquery.js"', 'Test required splat with value');
        server.assertResponse('GET', '/public/javascripts/jquery.js', 200, 'splat "javascripts/jquery.js"', 'Test required splat with segmented');
    }
}