
/**
 * Module dependencies.
 */

var connect = require('./../../lib/connect');

// Visit /style.css

connect.createServer(
    connect.staticProvider(__dirname + '/public')
).listen(3000);