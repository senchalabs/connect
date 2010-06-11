
// curl -H "Content-Type: application/json" -d "{ "jsonrpc": "2.0", "method": "add", "params": [1,2], "id":2 }" http://localhost:3000

module.exports = require('./lib/connect').createServer([
    { provider: 'jsonrpc', methods: {
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
]);