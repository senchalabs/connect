
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
            connect.cookieDecoder(),
            function(req, res, next){
                switch (n++) {
                    case 0:
                        assert.eql({}, req.cookies, 'Test cookies default to blank object');
                        break;
                    case 1:
                        assert.eql({ sid: '123' }, req.cookies, 'Test cookie parsing');
                        break;
                }
                next();
            }
        );
        server.request('GET', '/').end();
        server.request('GET', '/', { 'Cookie': 'sid=123' }).end();
    }
}