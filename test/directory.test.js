
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert');

var app = connect(
  connect.directory(__dirname + '/fixtures/directory')
);

module.exports = {
  'test default': function(){
    assert.response(app,
      { url: '/' },
      { body: 'bar\nbaz.js\nfoo\n' });
  },
  
  'test Accept: text/plain': function(){
    assert.response(app,
      { url: '/', headers: { Accept: 'text/plain' }},
      { body: 'bar\nbaz.js\nfoo\n' });
  },
  
  'test Accept: application/json': function(){
    assert.response(app,
      { url: '/', headers: { Accept: 'application/json' }},
      { body: '["bar","baz.js","foo"]' });
  }
};
