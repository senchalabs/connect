
/**
 * Module dependencies.
 */

var connect = require('./../../lib/connect')
  , server = connect.createServer();

server.use(connect.basicAuth(function(user, pass){
  return 'tj' == user && 'foo' == pass;
}));

server.use(function(req, res){
  res.writeHead(200);
  res.end('woot! authorized');
});

server.listen(3000);
console.log('Connect server listening on port 3000');