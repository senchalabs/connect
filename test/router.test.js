
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
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
      { url: '/file' },
      { status: 404 });

    assert.response(app,
      { url: '/file/jquery.js' },
      { body: 'file jquery.js' });
    
    assert.response(app,
      { url: '/file/public/javascripts/jquery.js' },
      { body: 'file public/javascripts/jquery.js' });
  },
  
  'test several splats': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/file/*.*', function(req, res){
          res.end('file ' + req.params[0] + ' ext ' + req.params[1]);
        });

        app.get('/move/*/to/*', function(req, res){
          res.end('moved ' + req.params[0] + ' to ' + req.params[1]);
        });
      })
    );

    assert.response(app,
      { url: '/file/jquery.js' },
      { body: 'file jquery ext js' });
    
    assert.response(app,
      { url: '/file/public/javascripts/jquery.js' },
      { body: 'file public/javascripts/jquery ext js' });

    assert.response(app,
      { url: '/move/jquery/to/jquery.js' },
      { body: 'moved jquery to jquery.js' });
  },
  
  'test named captures': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/page/:from(\\d+)-:to(\\d+)', function(req, res){
          res.end('viewing ' + req.params.from + ' to ' + req.params.to);
        });
      })
    );

    assert.response(app,
      { url: '/page/1-9' },
      { body: 'viewing 1 to 9' });

    assert.response(app,
      { url: '/page/3-b' },
      { status: 404 });
  },
  
  'test format': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/users.:format', function(req, res){
          res.end('format ' + req.params.format);
        });

        app.get('/users', function(req, res){
          res.end('users');
        });
      })
    );

    assert.response(app,
      { url: '/users' },
      { body: 'users' });

    assert.response(app,
      { url: '/users.json' },
      { body: 'format json' });
  },
  
  'test optional format': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get('/users.:format?', function(req, res){
          res.end('format ' + (req.params.format || 'html'));
        });
      })
    );

    assert.response(app,
      { url: '/users' },
      { body: 'format html' });

    assert.response(app,
      { url: '/users.json' },
      { body: 'format json' });
  },
  
  'test regular expressions': function(){
    var app = connect.createServer(
      connect.router(function(app){
        app.get(/\/commits\/(\w+)\.\.(\w+)\/?/i, function(req, res){
          res.end(
              'from ' + req.params[0]
            + ' to ' + req.params[1]);
        });
      })
    );

    assert.response(app,
      { url: '/commits/abc..def' },
      { body: 'from abc to def' });
  },
  
  'test next()': function(){
    var hits = [];

    var app = connect.createServer(
      connect.router(function(app){
        app.get('/:user', function(req, res, next){
          hits.push('a');
          next();
        });
        
        app.get('/:user', function(req, res, next){
          hits.push('b');
          next();
        });
        
        app.get('/:user', function(req, res, next){
          hits.push('c');
          res.end(req.params.user);
        });
      })
    );
    
    assert.response(app,
      { url: '/tj' },
      { body: 'tj' },
      function(){
        hits.should.eql(['a', 'b', 'c']);
      });
  }
};
