
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should  = require('should')
  , http = require('http')
  , create = require('./common').create;

module.exports = {
  'test html': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/', headers: { Accept: 'text/html, application/json' }},
      { status: 500
      , headers: { 'Content-Type': 'text/html' }});
  },
  
  'test json': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/', headers: { Accept: 'application/json' }},
      { status: 500
      , headers: { 'Content-Type': 'application/json' }});
  },
  
  'test text': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler()
    );
    
    assert.response(app,
      { url: '/', headers: { Accept: 'text/plain' }},
      { status: 500
      , headers: { 'Content-Type': 'text/plain' }});
  },

  'test err.status': function(){
    var app = create(
      function(req, res, next){
        var err = new Error('oh no');
        err.status = 501;
        next(err);
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/' },
      { status: 501 });
  },

  'test custom response code': function(){
    var app = create(
      function(req, res, next){
        res.statusCode = 501;
        throw new Error('oh no');
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/' },
      { status: 501 });
  }
}