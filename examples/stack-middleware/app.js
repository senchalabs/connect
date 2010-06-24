
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

var Server = module.exports = Connect.createServer();

Server.use('/', require('./hello'));
Server.use('/my', require('./world'));
Server.use('/', function(req, res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GET /hello or /my/world');
});