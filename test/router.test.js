
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

        app.get('/user/:id/:op', function(req, res){
          res.end(req.params.op + 'ing user ' + req.params.id);
        });
      })
    );

    assert.response(app,
      { url: '/user/12/' },
      { body: 'user 12' });

    assert.response(app,
      { url: '/user/12' },
      { body: 'user 12' });
    
    assert.response(app,
      { url: '/user/tj.holowaychuk' },
      { body: 'user tj.holowaychuk' });
    
    assert.response(app,
      { url: '/user/12/edit' },
      { body: 'editing user 12' });
  },
  
  'test optional params': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/user/:id?', function(req, res){
          res.end('user ' + (req.params.id || 'account'));
        });

        app.get('/account/:id?/:op', function(req, res){
          res.end(req.params.op + 'ing user ' + (req.params.id || 'account'));
        });
      })
    );

    assert.response(app,
      { url: '/user/12' },
      { body: 'user 12' });
    
    assert.response(app,
      { url: '/account/edit' },
      { body: 'editing user account' });

    assert.response(app,
      { url: '/account/12/edit' },
      { body: 'editing user 12' });
  },
  
  'test splat': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/file/*', function(req, res){
          res.end('file ' + req.params[0]);
        });
      })
    );

    assert.response(app,
      { url: '/file/jquery.js' },
      { body: 'file jquery.js' });
    
    assert.response(app,
      { url: '/file/public/javascripts/jquery.js' },
      { body: 'file public/javascripts/jquery.js' });
  }
};
