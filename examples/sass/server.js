
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

var pub = __dirname + '/public';
var views = __dirname + '/views';

/**
 * Update development submodules (git submodule update --init),
 * or comment out the following line if you have "sass" installed.
 */

require.paths.unshift(__dirname + '/../../support/sass/lib');

// To compile simply execute:
//   $ curl http://localhost:3000/stylesheets/main.css

connect.createServer(
    connect.compiler({ src: views, dest: pub, enable: ['sass'] }),
    connect.staticProvider(pub)
).listen(3000);
console.log('Connect server listening on port 3000');