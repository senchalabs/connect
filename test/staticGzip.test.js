
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http'),
    fs = require('fs');

/**
 * Path to ./test/fixtures/
 */

var fixturesPath = __dirname + '/fixtures';

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
    },
    
    'test non-compressable': function(){
        var server = helpers.run(
            connect.staticGzip({ root: fixturesPath, compress: ['text/html'] }),
            connect.staticProvider(fixturesPath)
        );
        var req = server.request('GET', '/style.css', { Accept: 'gzip' });
        req.buffer = true;
        req.on('response', function(res){
            res.on('end', function(){
                assert.notEqual('gzip', res.headers['content-encoding']);
            });
        });
        req.end();
    },
    
    'test compressable': function(){
        var server = helpers.run(
            connect.staticGzip({ root: fixturesPath, compress: ['text/css', 'text/html'] }),
            connect.staticProvider(fixturesPath)
        );

        try {
            var stat = fs.statSync(fixturesPath + '/style.css'),
                path = fixturesPath + '/style.css.' + Number(stat.mtime) + '.gz';
            fs.unlinkSync(path);
        } catch (err) {
            // Ignore
        }
        
        server.pending = 2;
        // Pre-compression
        var req = server.request('GET', '/style.css', { 'Accept-Encoding': 'gzip' });
        req.buffer = true;
        req.on('response', function(res){
            res.on('end', function(){
                assert.notEqual('gzip', res.headers['content-encoding'], 'Content-Encoding: gzip when not gzipped');

                // Post-compression
                var req = server.request('GET', '/style.css', { 'Accept-Encoding': 'gzip' });
                req.buffer = true;
                req.on('response', function(res){
                    res.on('end', function(){
                        assert.equal('text/css', res.headers['content-type']);
                        assert.equal('gzip', res.headers['content-encoding'], 'missing Content-Encoding: gzip when gzipped');
                    });
                });
                req.end();
            });
        });
        req.end();
    }
}
