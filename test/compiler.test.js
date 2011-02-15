
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , fs = require('fs');

try {
  fs.unlinkSync(__dirname + '/fixtures/style.css');
} catch (err) {
  // ignore
}

module.exports = {
  test: function(){
    var app = connect.createServer(
      connect.compiler({
          src: __dirname + '/fixtures'
        , enable: ['sass', 'coffeescript']
      }),
      connect.static(__dirname + '/fixtures')
    );

    assert.response(app,
      { url: '/doesnotexist.css' },
      { status: 404 });

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
