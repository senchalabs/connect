
// curl -H Content-Type: application/json -d { "jsonrpc": "2.0", "method": "add", "params": [1,2], "id":2 } http://localhost:8888

require('./lib/connect').createServer([
    { provider: 'jsonrpc', param: {
        add: function(a, b){
            try {
                this(null, a + b);
            } catch (err) {
                this(err);
            }
        },
        sub: function(a, b){
            try {
                this(null, a - b);
            } catch (err) {
                this(err);
            }
        }
    }}
]).listen(8888);