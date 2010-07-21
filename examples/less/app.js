
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

var pub = __dirname + '/public';

/**
 * Update development submodules (git submodule update --init) or
 * comment out the next line if you have "less" installed.
 */

require.paths.unshift('../../support/less/lib/less');

var server = connect.createServer(
    connect.compiler({ src: pub, enable: ['less'] }),
    connect.staticProvider(pub)
);

server.listen(3000);
console.log('Connect server listening on port 3000');