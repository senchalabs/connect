
/**
 * Update development submodules (git submodule update --init),
 * and then execute:
 *
 *    $ ./bin/connect -I support/less/lib examples/less/app
 *
 */

var pub = __dirname + '/public';

module.exports = require('./../../lib/connect').createServer([
    { provider: 'less', root: pub, match: /\.css$/ },
    { provider: 'static', root: pub }
]);