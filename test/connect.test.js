
/**
 * Module dependencies.
 */

var connect = require('connect'),
    assert = require('assert')

Ext.test('Connect', {
    test_version: function(){
        assert.ok(/^\d+\.\d+\.\d+$/.test(connect.version), 'Test framework version format')
    },
    
    test_config: function(){
        assert.equal('localhost', connect.env.hostname, 'Test "development" environment config loaded by default')
        assert.equal('development', connect.env.name, 'Test env.name')
    }
})