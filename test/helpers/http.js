
/**
 * Module dependencies.
 */

var connect = require('connect'),
    http = require('http'),
    port = process.env.CONNECT_TEST_PORT || 7000,
    _run = connect.run;

// TODO: interval with pending responses

connect.run = function(configs){
    var server = _run(configs, port++),
        client = http.createClient(server.port),
        pending = 0;
    server.request = function(method, port, options) {
        ++pending;
        var req = client.request(method, port),
            options = options || {};
        req.addListener('response', function(res){
            if (options.buffer) {
                res.body = '';
                res.setEncoding(options.encoding || 'utf8');
                res.addListener('data', function(chunk){ res.body += chunk });
            }
            if (!--pending) {
                server.close();
            } 
        });
        return req;
    }
    return server;
}