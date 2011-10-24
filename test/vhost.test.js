
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should = require('should')
  , http = require('http');

module.exports = {
  'test with host': function(){
    var a = connect.createServer(function(req, res){
      res.end('from foo');
    });
    
    var b = connect.createServer(function(req, res){
      res.end('from bar');
    });
    
    var app = connect.createServer(
        connect.vhost('foo.com', a)
      , connect.vhost('bar.com', b)
    );

    assert.response(app,
      { url: '/', headers: { Host: 'foo.com' }},
      { body: 'from foo' });
    
    assert.response(app,
      { url: '/', headers: { Host: 'bar.com' }},
      { body: 'from bar' });
    
    assert.response(app,
      { url: '/', headers: { Host: 'other.com' }},
      { body: 'Cannot GET /', status: 404 });
  },
  
  'test with wildcard': function(){
    var server = connect.createServer(function(req, res){
      res.end('from ' + req.subdomains.join(', '));
    });
    
    var app = connect.createServer(
        connect.vhost('*.foo.com', server)
      , connect.vhost('foo.com', server)
    );

    assert.response(app,
      { url: '/', headers: { Host: 'foo.com' }},
      { body: 'from foo' });
    
    assert.response(app,
      { url: '/', headers: { Host: 'tj.foo.com' }},
      { body: 'from tj, foo' });
  
    assert.response(app,
      { url: '/', headers: { Host: 'holowaychuk.tj.foo.com' }},
      { body: 'from holowaychuk, tj, foo' });
  }
};