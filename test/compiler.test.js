
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , fs = require('fs');

var fixtures = __dirname + '/fixtures';

try {
  fs.unlinkSync(fixtures + '/style.css');
} catch (err) {
  // ignore
}

module.exports = {
  test: function(){
    var app = connect.createServer(
      connect.compiler({
          src: fixtures
        , enable: ['sass', 'coffeescript']
      }),
      connect.static(fixtures)
    );

    assert.response(app,
      { url: '/doesnotexist.css' },
      { body: 'Cannot GET /doesnotexist.css', status: 404 });
    
    assert.response(app,
      { url: '/style.css' },
      { body: 'body {\n  font-size: 12px;\n  color: #000;}\n' });
    
    assert.response(app,
      { url: '/style.css' },
      { body: 'body {\n  font-size: 12px;\n  color: #000;}\n' });
    
    assert.response(app,
      { url: '/foo.bar.baz.css' },
      { body: 'foo {\n  color: #000;}\n' });
  },

  'test .compilers': function(){
    connect.compiler.compilers.should.be.a('object');
  }
};
