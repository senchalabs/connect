
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

var pub = __dirname + '/public';

/**
 * Update development submodules (git submodule update --init),
 * or comment out the following line if you have "sass" installed.
 */

require.paths.unshift('../../support/sass/lib');

connect.createServer(
    connect.compiler({ src: pub, enable: ['sass'] }),
    connect.staticProvider(pub)
).listen(3000);
console.log('Connect server listening on port 3000');