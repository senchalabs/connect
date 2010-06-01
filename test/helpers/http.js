
/**
 * Module dependencies.
 */

var connect = require('connect'),
    assert = require('assert'),
    http = require('http'),
    net = require('net'),
    sys = require('sys');

/**
 * Test base port.
 */

port = process.env.CONNECT_TEST_PORT || 12345;

connect.Server.prototype.listen = function(){
    var self = this,
        client = http.createClient(port),
        pending = 0;
    
    /**
     * Request helper.
     */    
    
    this.request = function(){
        ++pending;
        var req = client.request.apply(client, arguments);
        req.addListener('response', function(res){
            if (req.buffer) {
                res.body = '';
                res.setEncoding('utf8');
                res.addListener('data', function(chunk){ res.body += chunk });
            }
            if (!--pending) {
                self.close();
            } 
        });
        return req;
    }
    
    /**
     * Response assertion helper.
     */
    
    this.assertResponse = function(method, path, expectedStatus, expectedBody, msg){
        var req = this.request(method, path);
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(expectedStatus, 
                    res.statusCode, 
                    msg + ' status code of ' + expectedStatus + ', got ' + res.statusCode);
                assert.equal(expectedBody, 
                    res.body, 
                    msg + ' response body of ' + sys.inspect(expectedBody) + ', got ' + sys.inspect(res.body));
            });
        });
        req.end();
    }
    
    net.Server.prototype.listen.call(this, this.port = port++);
    return this;
}