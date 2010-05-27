
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

Ext.test('Connect body-decoder', {
    test: function(){
        var server = connect.run([
            { filter: 'body-decoder' },
            { module: {
                handle: function(req, res){
                    assert.eql({ user: { name: 'tj' }}, req.params.post, 'Test body-decoder req.params')
                    assert.equal('user[name]=tj', req.body, 'Test body-decoder req.body')
                    res.writeHead(200);
                    res.end();
                }
            }}
        ]);
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('user[name]=tj')
        req.end();
    }
})