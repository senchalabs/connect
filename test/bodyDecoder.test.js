
/**
 * Module dependencies.
 */

var connect = require('connect'),
    assert = require('assert'),
    http = require('http');

var app = connect.createServer(
  connect.bodyDecoder(),
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
      { body: '' });
  }
};