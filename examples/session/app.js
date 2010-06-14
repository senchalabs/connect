
module.exports = require('./../../lib/connect').createServer([
    { filter: 'cookie' },
    { filter: 'session' },
    { module: {
        handle: function(req, res, next){
            res.writeHead(200, {});
            res.end('Wahoo');
        }
    }}
]);