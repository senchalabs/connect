
/**
 * Module dependencies.
 */

var sys = require('sys');

module.exports = require('./../../lib/connect').createServer([
    { filter: 'cookie' },
    { filter: 'session' },
    { module: {
        handle: function(req, res, next){
            if (!req.session.name) {
                req.session.name = 'tj';
                sys.puts('set name');
            } else {
                sys.puts('got name ' + req.session.name);
            }
            res.writeHead(200, {});
            res.end('Wahoo');
        }
    }}
]);