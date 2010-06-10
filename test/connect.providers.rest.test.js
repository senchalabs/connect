
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
                    }
                }
            }}
        ]);
        server.assertResponse('GET', '/', 200, 'got /', 'Test rest GET /');
        server.assertResponse('GET', '/user', 404, 'Cannot find /user', 'Test rest GET unmatched path param');
        server.assertResponse('GET', '/user/12', 200, 'got user 12', 'Test rest GET matched path param');
        server.assertResponse('GET', '/user/12/', 200, 'got user 12', 'Test rest GET matched path param with trailing slash');
        server.assertResponse('GET', '/user/99/edit', 200, 'editing user 99', 'Test rest GET matched path with several params');
    }
}