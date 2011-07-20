
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , http = require('http')
  , create = require('./common').create;

module.exports = {
  'test headers': function(){
    var app = create(connect.favicon());

    assert.response(app,
      { url: '/favicon.ico' },
      { status: 200
      , headers: {
          'Content-Type': 'image/x-icon'
        , 'Cache-Control': 'public, max-age=86400'
      }});
  },
  
  'test custom favicon': function(){
    var app = connect();
    app.use(connect.favicon(__dirname + '/../lib/public/favicon.ico'));
    assert.response(http.createServer(app),
      { url: '/favicon.ico' },
      { status: 200, headers: { 'Content-Type': 'image/x-icon' }});
  }
};
