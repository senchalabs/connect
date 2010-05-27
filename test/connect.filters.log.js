
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

Ext.test('Connect log', {
    test: function(){
        var logs = [];
        var stream = {
            write: function(str){
                logs.push(str);
            }
        }
        var orig = Date.prototype.toUTCString;
        Date.prototype.toUTCString = function(){
            return 'Thu, 27 May 2010 03:23:50 GMT';
        }
        var server = connect.run([
            ['/', 'connect/filters/log', stream],
            ['/', 'filters/uppercase'],
            ['/', 'providers/echo']
        ]);
        var req = server.request('POST', '/');
        req.addListener('response', function(res){
            assert.equal(
                '127.0.0.1 - - [Thu, 27 May 2010 03:23:50 GMT] "POST / HTTP/1.1" 200 - "" ""', 
                logs[0],
                'Test log filter output');
            Date.prototype.toUTCString = orig;
        })
        req.write('foobar');
        req.end();
    }
})