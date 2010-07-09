
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

// Stores

var MemoryStore = require('connect/middleware/session/memory');

module.exports = {
    'test MemoryStore': function(){
        var n = 0, sid,
            memory = new MemoryStore({ reapInterval: -1 });

        var server = helpers.run(
            connect.cookieDecoder(),
            connect.session({ store: memory }),
            connect.flash(),
            function(req, res, next){
                switch (n++) {
                    case 0:
                        assert.eql({}, req.flash());
                        assert.eql([], req.flash('info'));
                        req.flash('info', 'email _sending_');
                        assert.equal(2, req.flash('info', 'email sent <em>successfully</em>'));
                        break;
                    case 1:
                        assert.eql(['email <em>sending</em>', 'email sent &lt;em&gt;successfully&lt;/em&gt;'], req.flash('info'));
                        assert.eql([], req.flash('info'));
                        break;
                    case 2:
                        assert.eql([], req.flash('info'));
                        req.flash('error', 'email failed');
                        req.flash('info', 'email re-sent');
                        break;
                    case 3:
                        assert.eql({ info: ['email re-sent'], error: ['email failed'] }, req.flash());
                        assert.eql({ }, req.flash());
                        break;
                }
                next();
            }
        );

        server.pending = 4;
        var req = server.request('GET', '/');
        req.addListener('response', function(res){
            var setCookie = res.headers['set-cookie'];
            sid = setCookie.match(/connect\.sid=([^;]+)/)[1];
            res.addListener('end', function(){
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid }).end();
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid }).end();
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid }).end();
            });
        });
        req.end();
    }
};