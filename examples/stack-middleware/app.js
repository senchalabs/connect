
require('./lib/connect').createServer([
    { module: require('./hello') },
    { module: require('./world') },
    { module: {
        handle: function(err, req, res){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('GET /hello or /world');
        }
    }}
]).listen();