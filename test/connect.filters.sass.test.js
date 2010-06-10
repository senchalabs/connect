
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    test: function(){
        var server = helpers.run([
            { provider: 'sass', root: __dirname + '/fixtures' },
            { module: require('./providers/echo') }
        ]);
        var req = server.request('GET', '/style.sass');
        req.addListener('response', function(res){
            assert.equal('text/css', res.headers['content-type'], 'Test sass Content-Type');
        });
        req.end();
        server.assertResponse('GET', '/style.sass', 200, 'body {\n  font-size: 12px;\n  color: #000;}\n', 'Test sass non-match pass through');
        server.assertResponse('GET', '/foo.bar.baz.sass', 200, 'foo {\n  color: #000;}\n', 'Test sass non-match pass through');
    }
}