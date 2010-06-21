
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
            { provider: 'less', root: __dirname + '/fixtures' },
            { module: require('./providers/echo') }
        ]);
        var req = server.request('GET', '/style.less');
        req.addListener('response', function(res){
            assert.equal('text/css', res.headers['content-type'], 'Test less Content-Type');
        });
        req.end();
        server.assertResponse('GET', '/doesnotexist.less', 404, 'Not Found');
        server.assertResponse('GET', '/style.less', 200, 'body {\n  color: #cc0000;\n}\n');
    }
}