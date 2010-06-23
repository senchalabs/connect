
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    test: function(){
        //var server = helpers.run([
        //    { filter: 'compiler', src: __dirname + '/fixtures', enable: ['sass'] }
        //]);
        // server.assertResponse('GET', '/doesnotexist.css', 404, 'Not Found');
        // server.assertResponse('GET', '/style.css', 200, 'body {\n  font-size: 12px;\n  color: #000;}\n');
        // server.assertResponse('GET', '/foo.bar.baz.css', 200, 'foo {\n  color: #000;}\n');
    }
}