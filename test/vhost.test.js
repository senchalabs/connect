
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
    },
    
    'test wildcard': function(){
        var server = helpers.run(
            connect.vhost('*.foo.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from foo ' + req.subdomains[0]);
                }
            )),
            connect.vhost('*.bar.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from bar ' + req.subdomains[0]);
                }
            )),
            connect.vhost('foo.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from foo');
                }
            )),
            connect.vhost('baz.com', connect.createServer(
                function(req, res){
                    res.writeHead(200, {});
                    res.end('from baz');
                }
            ))
        );
        
        var req = server.request('GET', '/', { Host: 'tj.foo.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('from foo tj', res.body);
            });
        });
        req.end();
        
        var req = server.request('GET', '/', { Host: 'tobi.foo.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('from foo tobi', res.body);
            });
        });
        req.end();
        
        var req = server.request('GET', '/', { Host: 'foo.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('from foo', res.body);
            });
        });
        req.end();
        
        var req = server.request('GET', '/', { Host: 'someone.bar.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('from bar someone', res.body);
            });
        });
        req.end();
        
        var req = server.request('GET', '/', { Host: 'something.baz.com' });
        req.buffer = true;
        req.addListener('response', function(res){
            assert.equal(404, res.statusCode);
        });
        req.end();
    },
    
    'test standard http server': function() {
        var server = helpers.run(
            connect.vhost('foo.com', http.createServer(
                function(req, res){
                    res.writeHead(200);
                    res.end('from foo');
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
    }
}
