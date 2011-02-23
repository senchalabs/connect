
/**
 * Module dependencies.
 */

var connect = require('./../../lib/connect');

var server = connect.createServer();

server.use('/', require('./hello'));
server.use('/my', require('./world'));
server.use('/', function(req, res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GET /hello or /my/world');
});

server.listen(3000);
console.log('Connect server listening on port 3000');