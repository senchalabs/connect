var http = require('http'),
    Connect = require('../../lib/connect');

var server = http.createServer(function (req, res) {
    res.writeHead(200, {"Content-Type":"text/plain"});
    res.end("This is a test of the connect embedding system....");
});

module.exports = Connect.createServer(
    Connect.logger(),
    Connect.cache(),
    Connect.gzip(),
    server
);