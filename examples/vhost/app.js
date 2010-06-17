
/**
 * Module dependencies.
 */

var connect = require('./../../lib/connect');

module.exports = connect.createServer([
    // Shared middleware
    { filter: 'log' },
    { filter: 'vhost', hosts: {
        // http://localhost:3000
        'localhost': connect.createServer([
            { module: {
                handle: function(req, res){
                    res.writeHead(200, {});
                    res.end('local vhost');
                }
            }}
        ]),
        // http://dev:3000
        'dev': connect.createServer([
            { module: {
                handle: function(req, res){
                    res.writeHead(200, {});
                    res.end('dev vhost');
                }
            }}
        ])
    }}
]);