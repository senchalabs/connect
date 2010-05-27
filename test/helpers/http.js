
/**
 * Module dependencies.
 */

var connect = require('connect'),
    http = require('http'),
    net = require('net');

/**
 * Test base port.
 */

port = process.env.CONNECT_TEST_PORT || 7000;

connect.Server.prototype.listen = function(){
    var self = this,
        client = http.createClient(port),
        pending = 0;
    this.request = function() {
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
    net.Server.prototype.listen.call(this, this.port = port++);
    return this;
}