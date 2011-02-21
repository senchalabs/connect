
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
    'test valid file': function(){
        var server = helpers.run(
            connect.staticProvider(fixturesPath)
        );
        var req = server.request('GET', '/user.json');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                var headers = res.headers,
                    body = '{\n    "name": "tj",\n    "email": "tj@sencha.com"\n}';
                assert.equal(200, res.statusCode, 'Test static with valid file status code');
                assert.equal(body, res.body, 'Test static with valid file response body');
                assert.equal('application/json', headers['content-type'], 'Test static with valid file Content-Type');
                assert.equal(body.length, headers['content-length'], 'Test static with valid file Content-Length');
                assert.ok(headers['last-modified'], 'Test static with valid file Last-Modified');
                assert.ok(headers['cache-control'] == 'public max-age=0', 'Test static with valid file Cache-Control');
            });
        });
        req.end();
    },

    'test configurable cache-control': function(){
        var server = helpers.run(
            connect.staticProvider({ root: fixturesPath, maxAge: 60000 })
        );
        var req = server.request('GET', '/user.json');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.ok(res.headers['cache-control'] == 'public max-age=60', 'Test configurable Cache-Control support');
            });
        });
        req.end();
    },

    'test urlencoded': function(){
        var server = helpers.run(
            connect.staticProvider({ root: fixturesPath })
        );
        server.assertResponse('GET', '/some%20text.txt', 200, 'whoop', 'Test urlencoded path');
    },

    'test index.html support': function(){
        var server = helpers.run(
            connect.staticProvider({ root: fixturesPath })
        );
        server.assertResponse('GET', '/', 200, '<p>Wahoo!</p>', 'Test static index.html support.');
    },

    'test index.html support when missing': function(){
        var server = helpers.run(
            connect.staticProvider({ root: __dirname })
        );
        server.assertResponse('GET', '/', 404, 'Cannot GET /', 'Test static index.html support when missing.');
    },

    'test invalid file': function(){
        var server = helpers.run(
            connect.staticProvider({ root: fixturesPath })
        );
        server.assertResponse('GET', '/foo.json', 404, 'Cannot GET /foo.json', 'Test invalid static file.');
    },
    
    'test directory': function(){
        var server = helpers.run(
            connect.staticProvider({ root: __dirname })
        );
        server.assertResponse('GET', '/fixtures', 404, 'Cannot GET /fixtures');
    },
    
    'test forbidden': function(){
        var server = helpers.run(
            connect.staticProvider({ root: fixturesPath })
        );
        server.assertResponse('GET', '/../gzip.test.js', 403, 'Forbidden');
    },

    'test exclude': function(){
        var server = helpers.run(
            connect.staticProvider({
                root: fixturesPath,
                exclude: /.*\.sass$/
            })
        );
        server.assertResponse('GET', '/some%20text.txt', 200, 'whoop', 'Test urlencoded path');
        server.assertResponse('GET', '/style.sass', 404, 'Cannot GET /style.sass');
    }
};
