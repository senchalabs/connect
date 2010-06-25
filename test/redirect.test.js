
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    test: function(){
        var n = 0;
        var server = helpers.run(
            connect.redirect(),
            function(req, res, next){
                switch (n++) {
                    case 0:
                        res.redirect('/foo');
                        break;
                    case 1:
                        res.redirect('back', 301);
                        break;
                }
            }
        );

        var req = server.request('GET', '/');
        req.addListener('response', function(res){
            assert.equal(302, res.statusCode, 'Test redirect default status code')
            assert.equal('/foo', res.headers.location, 'Test redirect Location header');
        });
        req.end();
        
        var req = server.request('GET', '/', { 'Referrer': 'http://google.com' });
        req.addListener('response', function(res){
            assert.equal(301, res.statusCode, 'Test redirect custom status code')
            assert.equal('http://google.com', res.headers.location, 'Test redirect "back"')
        });
        req.end();
    }
}