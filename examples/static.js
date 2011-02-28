
/**
 * Module dependencies.
 */

var connect = require('../');

var oneDay = 86400000;

connect(
    connect.static(__dirname + '/public', { maxAge: oneDay })
  , function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.end('<img src="/tobi.jpeg" />')
  }
).listen(3000);