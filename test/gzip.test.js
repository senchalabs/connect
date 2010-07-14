var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

function server(headers) {
    headers = headers || {};
    headers['Content-Type'] = 'text/plain';
    return helpers.run(
        connect.gzip(),
        connect.createServer(
            function(req, res){
                res.writeHead(200, headers);
                res.end('can be compressed');
            })
    );
}

module.exports = {
    'test no compression': function(){
        var req = server().request('GET', '/', { });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('can be compressed', res.body);
            });
        });
        req.end();
    },
    'test compression': function(){
        var req = server().request('GET', '/', { 'Accept-Encoding': 'deflate, gzip' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('gzip', res.headers['content-encoding']);
                // we could uncompress in this test. for now, check
                // only that it's not the original body:
                assert.notEqual('can be compressed', res.body);
            });
        });
        req.end();
    },
    'test no compression with other content-encoding': function(){
        var req = server({ 'Content-Encoding': 'bogon' }).
            request('GET', '/', { 'Accept-Encoding': 'bogon, gzip' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('bogon', res.headers['content-encoding']);
                assert.equal('can be compressed', res.body);
            });
        });
        req.end();
    }
}
