
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

var pub = __dirname + '/public';

/**
 * Update development submodules (git submodule update --init),
 * and then execute:
 *
 *    $ ./bin/connect -I support/less/lib examples/less/app
 *
 */

module.exports = Connect.createServer(
    Connect.compiler({ src: pub, enable: ['less'] }),
    Connect.staticProvider(pub)
);