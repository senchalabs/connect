
module.exports = require('./../../lib/connect').createServer([
    { module: {
        handle: function(req, res){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello');
        }
    }, route: '/hello' }
]);