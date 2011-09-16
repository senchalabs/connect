
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , http = require('http')
  , create = require('./common').create;

var app = create(
    connect.query()
  , function(req, res){
    res.end(JSON.stringify(req.query));
  }
);

module.exports = {
  'test empty query string object': function(){
    assert.response(app,
      { url: '/' },
      { body: '{}' });
  },

  'test query string': function(){
    assert.response(app,
      { url: '/?foo=bar' },
      { body: '{"foo":"bar"}' });
  }
};
