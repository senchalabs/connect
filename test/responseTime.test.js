
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , create = require('./common').create;

var app = create(
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