
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , http = require('http');

var app = connect.createServer(
  connect.bodyParser(),
  function(req, res){
  res.writeHead(200);
  res.end(JSON.stringify(req.body));
});

module.exports = {
  'test x-www-form-urlencoded body': function(){
    assert.response(app,
      { url: '/'
      , data: 'foo=bar'
      , method: 'POST'
      , headers: { 'Content-Type': 'application/x-www-form-urlencoded' }},
      { body: '{"foo":"bar"}' });
  },
  
  'test PUT x-www-form-urlencoded body': function(){
    assert.response(app,
      { url: '/'
      , data: 'foo=bar'
      , method: 'PUT'
      , headers: { 'Content-Type': 'application/x-www-form-urlencoded' }},
      { body: '{"foo":"bar"}' });
  },
  
  'test json body': function(){
    assert.response(app,
      { url: '/'
      , data: '{"foo":"bar"}'
      , method: 'PUT'
      , headers: { 'Content-Type': 'application/json' }},
      { body: '{"foo":"bar"}' });
  },

  'test POST with no data': function(){
    assert.response(app,
      { url: '/', method: 'POST' },
      { body: '{}' });
  },

  'test GET with content-type': function(){
    assert.response(app,
      { url: '/', headers: { 'Content-Type': 'application/json' }},
      { body: '{}' });
  },
  
  'test custom parser': function(){
    connect.bodyParser.parse['application/x-awesome'] = function(req, options, fn){
      var buf = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){ buf += chunk; });
      req.on('end', function(){
        var parts = buf.split('.');
        req.body = {};
        req.body[parts.shift()] = parts.shift();
        fn();
      });
    };

    assert.response(app,
      { url: '/'
      , method: 'POST'
      , data: 'foo.bar'
      , headers: { 'Content-Type': 'application/x-awesome' }},
      { body: '{"foo":"bar"}' });
  },
  
  'test mount-safety': function(){
    var app = connect(
        connect.bodyParser()
      , function(req, res){
        res.end(req.body.name);
      }
    );

    var app2 = connect(connect.bodyParser());
    app2.use('/test', app);

    assert.response(app2,
      { url: '/test'
      , method: 'POST'
      , data: '{"name":"tj"}'
      , headers: { 'Content-Type': 'application/json' }},
      { body: 'tj' });
  }
};