
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

var port = exports.port = process.env.CONNECT_TEST_PORT || 12345;

connect.Server.prototype.listen = function(){
    var self = this,
        client = http.createClient(port),
        pending = 0;

    /**
     * Request helper.
     */

    this.request = function(){
        if (self.pending === undefined) ++pending;
        var req = client.request.apply(client, arguments);
        req.addListener('response', function(res){
            if (req.buffer) {
                res.body = '';
                res.setEncoding('utf8');
                res.addListener('data', function(chunk){ res.body += chunk });
            }
            if (self.pending === undefined) {
                if (!--pending) {
                    self.close();
                }
            } else if (!--self.pending) {
                self.close();
            }
        });
        return req;
    };

    /**
     * Response assertion helper.
     */

    this.assertResponse = function(method, path, expectedStatus, expectedBody, msg, fn){
        msg = msg || 'expected';
        var req = this.request(method, path);
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(expectedBody,
                    res.body,
                    msg + ' response body of ' + sys.inspect(expectedBody) + ', got ' + sys.inspect(res.body));
                assert.equal(expectedStatus,
                    res.statusCode,
                    msg + ' status code of ' + expectedStatus + ', got ' + res.statusCode);
                if (fn) fn(res);
            });
        });
        req.end();
    };

    /**
     * Assert response headers.
     */

    this.assertResponseHeaders = function(method, path, headers){
        var req = this.request(method, path);
        req.addListener('response', function(res){
            for (var key in headers) {
                assert.equal(headers[key], res.headers[key],
                    'expected response header ' + key + ' of "' + headers[key] + '"'
                    + ', got "' + res.headers[key] + '"');
            }
        });
        req.end();
    };

    net.Server.prototype.listen.call(this, this.port = port++);
    return this;
}