
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , create = require('./common').create;

module.exports = {
  'test with host': function(){
    var a = create(function(req, res){
      res.end('from foo');
    });
    
    var b = create(function(req, res){
      res.end('from bar');
    });
    
    var app = create(
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
    var server = create(function(req, res){
      res.end('from ' + req.subdomains.join(', '));
    });
    
    var app = create(
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