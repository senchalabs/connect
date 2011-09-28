
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

var app3 = create(
  connect.cookieParser('keyboard cat'),
  function(req, res, next){
    res.write(JSON.stringify(req.cookies));
    res.write(JSON.stringify(req.signedCookies));
    res.end();
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
      { url: '/', headers: { Cookie: ['cart=j:{"foo":"bar"}'] }},
      { body: '{"foo":"bar"}' });
  },
  
  'test malformed json cookie': function() {
    assert.response(app2,
      { url: '/', headers: { Cookie: ['cart=j:foo'] }},
      { body: '"j:foo"' });
  },

  'test signed cookie without secret': function(){
    assert.response(app,
      { url: '/', headers: { Cookie: ['cart=dG9iaSBpcyBjb29s.RH4vT0xcdOwqpYbHhj8RMzwpQoE'] }},
      { body: '{"cart":"dG9iaSBpcyBjb29s.RH4vT0xcdOwqpYbHhj8RMzwpQoE"}' });
  },
  
  'test signed cookie': function(){
    assert.response(app3,
      { url: '/', headers: { Cookie: ['cart=dG9iaSBpcyBjb29s.RH4vT0xcdOwqpYbHhj8RMzwpQoE'] }},
      { body: '{}{"cart":"tobi is cool"}' });
  },
  
  'test invalid signature': function(){
    assert.response(app3,
      { url: '/', headers: { Cookie: ['cart=dG9iaSBpcyBjb29s.RHs4vT0xcdOwqpYbHhj8RMzwpQoE'] }},
      { body: '{"cart":"dG9iaSBpcyBjb29s.RHs4vT0xcdOwqpYbHhj8RMzwpQoE"}{}' });
  },
  
  'test invalid value': function(){
    assert.response(app3,
      { url: '/', headers: { Cookie: ['cart=dG9iaSBpcyBjsb29s.RH4vT0xcdOwqpYbHhj8RMzwpQoE'] }},
      { body: '{"cart":"dG9iaSBpcyBjsb29s.RH4vT0xcdOwqpYbHhj8RMzwpQoE"}{}' });
  },
  
  'test signed cookie & regular cookie': function(){
    assert.response(app3,
      { url: '/', headers: { Cookie: ['cart=dG9iaSBpcyBjb29s.RH4vT0xcdOwqpYbHhj8RMzwpQoE', 'foo=bar', 'bar=baz'] }},
      { body: '{"foo":"bar","bar":"baz"}{"cart":"tobi is cool"}' });
  }
};
