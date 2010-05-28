
module.exports = require('./lib/connect').createServer([
    { module: {
        handle: function(err, req, res){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('World');
        }
    }, route: '/world' }
]);