
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , http = require('http')
  , create = require('./common').create;

var app = create(
  connect.cookieParser(),
  function(req, res, next){
    res.end(JSON.stringify(req.cookies));
  }
);

var app2 = create(
  connect.cookieParser(),
  function(req, res, next){
    res.end(JSON.stringify(req.cookies.cart));
  }
);


module.exports = {
  'test without cookies': function(){
    assert.response(app,
      { url: '/' },
      { body: '{}' });
  },
  
  'test single cookie': function(){
    assert.response(app,
      { url: '/', headers: { Cookie: ['sid=123'] }},
      { body: '{"sid":"123"}' });
  },
  
  'test several cookies': function(){
    assert.response(app,
      { url: '/', headers: { Cookie: ['sid=123', 'name=tj'] }},
      { body: '{"sid":"123","name":"tj"}' });
  },

  'test malformed cookie': function() {
    assert.response(app,
      { url: '/', headers: { Cookie: ['sid=%g23'] }},
      { body: '{"sid":"%g23"}' });
  },
  
  'test json cookie': function() {
    assert.response(app2,
      { url: '/', headers: { Cookie: ['cart=json{"foo":"bar"}'] }},
      { body: '{"foo":"bar"}' });
  },
  
  'test malformed json cookie': function() {
    assert.response(app2,
      { url: '/', headers: { Cookie: ['cart=jsonfoo'] }},
      { body: '"jsonfoo"' });
  }
};
