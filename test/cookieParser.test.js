
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , http = require('http');

module.exports = {
  test: function(){
    var n = 0;
    var app = connect.createServer(
      connect.cookieParser(),
      function(req, res, next){
        res.end(JSON.stringify(req.cookies));
      }
    );

    assert.response(app,
      { url: '/' },
      { body: '{}' });
    
    assert.response(app,
      { url: '/', headers: { Cookie: ['sid=123', 'foo=bar'] }},
      { body: '{"sid":"123","foo":"bar"}' });
  }
};