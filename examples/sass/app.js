
/**
 * Update development submodules (git submodule update --init),
 * and then execute:
 *
 *    $ ./bin/connect -I support/sass/lib examples/sass/app
 *
 */

var pub = __dirname + '/public';

module.exports = require('./../../lib/connect').createServer([
    { filter: 'compiler', src: pub, enable: ['sass'] },
    { provider: 'static', root: pub }
]);