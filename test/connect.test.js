
/**
 * Module dependencies.
 */

var connect = require('connect'),
    assert = require('assert'),
    http = require('http'),
    port = 7000

// TODO: mock out or better method for testing
// possibly add unix domain socket support to http
// client

Ext.test('Connect', {
    test_version: function(){
        assert.ok(/^\d+\.\d+\.\d+$/.test(connect.version), 'Test framework version format')
    },
    
    test_config: function(){
        assert.equal('localhost', connect.env.hostname, 'Test "development" environment config loaded by default')
        assert.equal('development', connect.env.name, 'Test env.name')
    },
    
    test_run: function(){
        var server = connect.run([
            ['/', 'filters/uppercase', 1, 2, 3],
            ['/', 'providers/echo']
        ], port++)
        var setupArgs = require('filters/uppercase').setupArgs
        assert.equal('development', setupArgs[0].name, 'Test env passed to setup() as first arg')
        assert.eql([1,2,3], Array.prototype.slice.call(setupArgs, 1), 'Test remaining setup() args')
        var client = http.createClient(port - 1)
        var req = client.request('POST', '/')
        req.addListener('response', function(res){
            res.body = ''
            res.setEncoding('utf8')
            res.addListener('data', function(chunk){
                res.body += chunk
            })
            res.addListener('end', function(){
                assert.equal('HELLO WORLD', res.body, 'Test provider response')
            })
        })
        req.write('hello world')
        req.end()
    }
})