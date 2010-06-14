
module.exports = require('./../../lib/connect').createServer([
    { module: require('./hello') },
    { module: require('./world'), route: '/my' },
    { module: {
        handle: function(req, res){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('GET /hello or /my/world');
        }
    }}
]);