
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

var pub = __dirname + '/public';

/**
 * Update development submodules (git submodule update --init),
 * and then execute:
 *
 *    $ ./bin/connect -I support/sass/lib examples/sass/app
 *
 */

module.exports = Connect.createServer(
    Connect.compiler({ src: pub, enable: ['sass'] }),
    Connect.staticProvider(pub)
);