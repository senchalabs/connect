// Note that even though this looks like a normal node http app, it's really a
// valid connect app using the connect middleware stack.

var connect = require('../../lib/connect');

var server = connect.createServer(function(req, res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World');
});

server.listen(3000);
console.log('Connect server listening on port 3000');