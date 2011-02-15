
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , http = require('http');

module.exports = {
  'test methods': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/', function(req, res){
          res.end('GET /');
        });
        
        app.post('/', function(req, res){
          res.end('POST /');
        });
        
        app.put('/', function(req, res){
          res.end('PUT /');
        });
      })
    );

    assert.response(app,
      { url: '/' },
      { body: 'GET /' });
    
    assert.response(app,
      { url: '/', method: 'POST' },
      { body: 'POST /' });
    
    assert.response(app,
      { url: '/', method: 'PUT' },
      { body: 'PUT /' });
  },
  
  'test params': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/user/:id', function(req, res){
          res.end('user ' + req.params.id);
        });
      });
    );

    assert.response(app,
      { url: '/user/12' },
      { body: 'user 12' });
  }
};
