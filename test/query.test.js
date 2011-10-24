
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , http = require('http');

var app = connect(
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
