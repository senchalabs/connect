
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
    'test GET': function(){
        var server = helpers.run([
            { provider: 'rest', routes: {
                get: {
                    '/': function(req, res){
                        res.writeHead(200, {});
                        res.end('got /');
                    },
                    '/user/:id': function(req, res, params){
                        res.writeHead(200, {});
                        res.end('got user ' + params.id);
                    },
                    '/user/:id/:operation': function(req, res, params){
                        res.writeHead(200, {});
                        res.end(params.operation + 'ing user ' + params.id);
                    },
                    '/range/:from..:to': function(req, res, params){
                        res.writeHead(200, {});
                        res.end('range ' + params.from + ' to ' + params.to);
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
        server.assertResponse('GET', '/', 200, 'got /', 'Test rest GET /');
        server.assertResponse('GET', '/user', 404, 'Cannot find /user', 'Test rest GET unmatched path param');
        server.assertResponse('GET', '/user/12', 200, 'got user 12', 'Test rest GET matched path param');
        server.assertResponse('GET', '/user/12/', 200, 'got user 12', 'Test rest GET matched path param with trailing slash');
        server.assertResponse('GET', '/user/99/edit', 200, 'editing user 99', 'Test rest GET matched path with several params');
        server.assertResponse('GET', '/range/11..99', 200, 'range 11 to 99');
        server.assertResponse('GET', '/users.json', 200, 'json format');
        server.assertResponse('GET', '/cookies', 200, 'num num', 'Test rest optional placeholder without value');
        server.assertResponse('GET', '/cookies.json', 200, '["num","num"]', 'Test reset optional placeholder with value');
    }
}