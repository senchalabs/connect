
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
                    }
                }
            }}
        ]);
        server.assertResponse('GET', '/', 200, 'got /', 'Test rest GET /');
    }
}