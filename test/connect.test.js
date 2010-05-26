
/**
 * Module dependencies.
 */

var connect = require('connect'),
    assert = require('assert')

Ext.test('Connect', {
    test_version: function(){
        assert.ok(/^\d+\.\d+\.\d+$/.test(connect.version), 'Test framework version format')
    }
})