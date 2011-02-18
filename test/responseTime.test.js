
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http');

var app = connect.createServer(
  connect.responseTime(),
  function(req, res){
    setTimeout(function(){
      res.end('Hello');
    }, 500);
  }
);

module.exports = {
  'test X-Response-Time': function(){
    assert.response(app,
      { url: '/' },
      { body: 'Hello'
      , headers: {
        'X-Response-Time': /^\d+ms$/
      }});
  }
};