
/**
 * Module dependencies.
 */

var connect = require('connect')
  , should = require('should')
  , assert = require('assert')
  , http = require('http');

var MemoryStore = connect.session.MemoryStore
  , store = new MemoryStore({ reapInterval: -1 });

var app = connect.createServer(
    connect.cookieParser()
  , connect.session({ secret: 'keyboard cat', store: store })
  , function(req, res, next){
    res.end('wahoo');
  }
);

module.exports = {
  'test Set-Cookie header': function(){
    assert.response(app,
      { url: '/' },
      { body: 'wahoo'
      , headers: {
        'Set-Cookie': /^connect\.sid=\w+\.\w+; path=\/; httpOnly; expires=/
      }});
  }
};