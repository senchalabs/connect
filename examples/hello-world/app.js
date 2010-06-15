
module.exports = require('./lib/connect').createServer([
    { filter: 'log', format: ':remote-addr :method :url :status :res[Content-Length] :response-timems' },
    { provider: 'bounce-favicon' },
    { filter: 'response-time' },
    { module: {
        handle: function(req, res){
            var body = 'Hello World';
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Length': body.length
            });
            res.end(body);
        }
    }}
]);
