
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

// Make sure to:
//   $ npm install stylus

// To compile simply execute:
//   $ curl http://localhost:3000/stylesheets/main.css

connect.createServer(
    connect.compiler({ src: __dirname + '/public', enable: ['stylus'] }),
    connect.staticProvider(pub)
).listen(3000);
console.log('Connect server listening on port 3000');