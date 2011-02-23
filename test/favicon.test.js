
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , http = require('http');

module.exports = {
  'test headers': function(){
    var app = connect.createServer(connect.favicon());

    assert.response(app,
      { url: '/favicon.ico' },
      { status: 200
      , headers: {
          'Content-Type': 'image/x-icon'
        , 'Cache-Control': 'public max-age=86400'
      }});
  },
  
  'test custom favicon': function(){
    var app = connect.createServer();
    app.use(connect.favicon(__dirname + '/../lib/connect/public/favicon.ico'));
    assert.response(app,
      { url: '/favicon.ico' },
      { status: 200, headers: { 'Content-Type': 'image/x-icon' }});
  }
};
