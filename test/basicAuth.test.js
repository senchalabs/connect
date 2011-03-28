
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , http = require('http');

// sync

var app = connect(
  connect.basicAuth(function(user, pass){
    return 'tj' == user && 'tobi' == pass;
  }),
  function(req, res){
    res.end('wahoo');
  }
);

// async

var User = {
  find: function(query, fn){
    if (query.name == 'tj' && query.pass == 'tobi') {
      fn(null, { name: 'tj' });
    } else {
      fn(new Error('user not found'));
    }
  }
}

var async = connect(
  connect.basicAuth(function(user, pass, fn){
    User.find({ name: user, pass: pass }, fn);
  }),
  function(req, res){
    res.end('wahoo');
  }
);

module.exports = {
  'test missing Authorization field': function(){
    assert.response(app,
      { url: '/' },
      { body: 'Unauthorized'
      , status: 401
      , headers: {
        'WWW-Authenticate': 'Basic realm="Authorization Required"'
      }});
  },
  
  'test authorized': function(){
    assert.response(app,
      { url: '/', headers: { Authorization: 'Basic dGo6dG9iaQ==' }},
      { body: 'wahoo', status: 200 });
  },
  
  'test unauthorized': function(){
    assert.response(app,
      { url: '/', headers: { Authorization: 'Basic dasdfasdfas' }},
      { body: 'Unauthorized', status: 401 });
  },
  
  'test bad request': function(){
    assert.response(app,
      { url: '/', headers: { Authorization: 'Foo asdfasdf' }},
      { body: 'Bad Request', status: 400 });
  },
  
  'test async authorized': function(){
    assert.response(async,
      { url: '/', headers: { Authorization: 'Basic dGo6dG9iaQ==' }},
      { body: 'wahoo', status: 200 });
  },
};