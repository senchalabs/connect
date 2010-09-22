
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test with host': function(){
        var server = helpers.run(
            connect.vhost('foo.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from foo');
                }
            )),
            connect.vhost('bar.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from bar');
                }
            ))
        );

        var req = server.request('GET', '/', { Host: 'foo.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('from foo', res.body);
            });
        });
        req.end();

        var req = server.request('GET', '/', { Host: 'bar.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('from bar', res.body);
            });
        });
        req.end();
    },
    'test without host': function(){
        var server = helpers.run(
            connect.vhost('foo.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from foo');
                }
            ))
        );
        
        var req = server.request('GET', '/');
        req.addListener('response', function(res){
            assert.equal(404, res.statusCode);
        });
        req.end();
    }
}
