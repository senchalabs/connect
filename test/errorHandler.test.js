
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should  = require('should')
  , http = require('http');

module.exports = {
  'test defaults with next(err)': function(){
    var app = connect.createServer(
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
    var app = connect.createServer(
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
    var app = connect.createServer(
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
  
  'test showStack': function(){
    var app = connect.createServer(
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
  }
}