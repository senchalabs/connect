
/**
 * Module dependencies.
 */

var connect = require('../')
  , http = require('http');

var app = connect();
app.use(connect.staticCache());
app.use(connect.static(__dirname + '/public', { maxAge: 0 }));
app.use(function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.end('<img src="/tobi.jpeg" />')
});

http.createServer(app).listen(3000);