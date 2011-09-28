
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should  = require('should')
  , http = require('http')
  , create = require('./common').create;

module.exports = {
  'test defaults with next(err)': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/' },
      { body: 'Internal Server Error'
      , status: 500 });
  },
  
  'test defaults with caught exception': function(){
    var app = create(
      function(req, res, next){
        throw new Error('keyboard cat!');
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/' },
      { body: 'Internal Server Error'
      , status: 500 });
  },
  
  'test showMessage': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ showMessage: true })
    );

    assert.response(app,
      { url: '/' },
      { body: 'Error: keyboard cat!'
      , status: 500 });
  },
  
  'test message': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ message: true })
    );

    assert.response(app,
      { url: '/' },
      { body: 'Error: keyboard cat!'
      , status: 500 });
  },
  
  'test showStack': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ showStack: true })
    );

    assert.response(app,
      { url: '/' },
      function(res){
        var buf = '';
        res.body.should.include.string('Error: keyboard cat!');
        res.body.should.include.string('test/errorHandler.test.js');
      });
  },
  
  'test stack': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ stack: true })
    );

    assert.response(app,
      { url: '/' },
      function(res){
        var buf = '';
        res.body.should.include.string('Error: keyboard cat!');
        res.body.should.include.string('test/errorHandler.test.js');
      });
  },
  
  'test showStack html': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ stack: true })
    );

    assert.response(app,
      { url: '/', headers: { Accept: 'text/html, application/json' }},
      { status: 500
      , headers: { 'Content-Type': 'text/html' }});
  },
  
  'test showStack json': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ stack: true })
    );

    assert.response(app,
      { url: '/', headers: { Accept: 'application/json' }},
      { status: 500
      , headers: { 'Content-Type': 'application/json' }});
  },
  
  'test showStack text': function(){
    var app = create(
      function(req, res, next){
        next(new Error('keyboard cat!'));
      },
      connect.errorHandler({ stack: true })
    );
    
    assert.response(app,
      { url: '/', headers: { Accept: 'text/plain' }},
      { status: 500
      , headers: { 'Content-Type': 'text/plain' }});
  },
  
  'test custom response code': function(){
    var app = create(
      function(req, res, next){
        res.statusCode = 501;
        throw new Error('oh no');
      },
      connect.errorHandler({ stack: true })
    );

    assert.response(app,
      { url: '/' },
      { status: 501 });
  }
}