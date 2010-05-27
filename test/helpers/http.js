
/**
 * Module dependencies.
 */

var connect = require('connect'),
    http = require('http'),
    port = process.env.CONNECT_TEST_PORT || 7000;

connect.Server.prototype.run = function(){
    var server = http.createServer(this.handle),
        client = http.createClient(server.port = port),
        pending = 0;
    server.request = function() {
        ++pending;
        var req = client.request.apply(client, arguments);
        req.addListener('response', function(res){
            if (req.buffer) {
                res.body = '';
                res.setEncoding('utf8');
                res.addListener('data', function(chunk){ res.body += chunk });
            }
            if (!--pending) {
                server.close();
            } 
        });
        return req;
    }
    server.listen(port++);
    return server;
}