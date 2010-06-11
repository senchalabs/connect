
module.exports = require('./lib/connect').createServer([
    { filter: 'log', format: ':remote-addr :method :url HTTP/:http-version :status :content-length :response-timems' },
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
