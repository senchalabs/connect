
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

// TODO: Accepts: gzip
// TODO: Transfer-Encoding: gzip

module.exports = {
    'test does not Accept gzip': function(){
        var server = helpers.run(
            connect.staticGzip({ root: fixturesPath, compress: ['text/css'] }),
            connect.staticProvider(fixturesPath)
        );
        var req = server.request('GET', '/style.css');
        req.buffer = true;
        req.on('response', function(res){
            res.on('end', function(){
                assert.notEqual('gzip', res.headers['content-encoding']);
            });
        });
        req.end();
    }
}
