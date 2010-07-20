
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    test: function(){
        var server = helpers.run(
            connect.compiler({ src: __dirname + '/fixtures', enable: ['sass'] }),
            connect.staticProvider(__dirname + '/fixtures')
        );
        server.assertResponse('GET', '/doesnotexist.css', 404, 'Cannot GET /doesnotexist.css');
        server.assertResponse('GET', '/style.css', 200, 'body {\n  font-size: 12px;\n  color: #000;}\n');
        server.assertResponse('GET', '/style.css', 200, 'body {\n  font-size: 12px;\n  color: #000;}\n');
        server.assertResponse('GET', '/foo.bar.baz.css', 200, 'foo {\n  color: #000;}\n');
        server.assertResponse('GET', '/foo.bar.baz.css', 200, 'foo {\n  color: #000;}\n');
    }
}