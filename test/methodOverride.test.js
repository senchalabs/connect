
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , create = require('./common').create;

var app = create(
  connect.bodyParser(),
  connect.methodOverride(),
  function(req, res){
    res.end(req.method);
  }
);

module.exports = {
  'test request body': function(){
    assert.response(app,
      { url: '/'
      , method: 'POST'
      , data: '_method=put'
      , headers: { 'Content-Type': 'application/x-www-form-urlencoded' }},
      { body: 'PUT' });
  },
  
  'test x-http-method-override': function(){
    assert.response(app,
      { url: '/'
      , method: 'POST'
      , data: '_method=put'
      , headers: { 'X-HTTP-Method-Override': 'DELETE' }},
      { body: 'DELETE' });
  }
};