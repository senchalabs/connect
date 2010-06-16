
/**
 * Module dependencies.
 */

var http = require('http');

// Use `$ connect -C examples/config` 
//   to chdir, and auto-discover config.js or
// Use `$ connect --config examples/config/config examples/config/app`
//   to pass an explicit path to your configuration file, and
//   then load the app relative to the CWD

module.exports = http.createServer(function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Wahoo');
});