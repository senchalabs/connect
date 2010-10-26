// Note that even though this looks like a normal node http app, it's really a
// valid connect app using the connect middleware stack.

var connect = require('../../lib/connect');

var server = connect.createServer(function(req, res){
  var body = 'Hello World';
  res.writeHead(200, {
      'Content-Type': 'text/plain'
    , 'Content-Length': body.length
  });
  res.end(body);
});

server.listen(3000);
console.log('Connect server listening on port 3000');