
/**
 * Module dependencies.
 */

var http = require('http');

/**
 * `$ connect --chdir examples/config`
 * will auto-detect ./config.js and apply it.
 *
 * `$ connect --config path/to/config examples/config.app`
 * will load the app relative to CWD, and the given config module.
 *
 * NOTE: you can use --config several times to apply different configurations
 *       if needed.
 */

module.exports = http.createServer(function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Wahoo');
});