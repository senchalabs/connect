
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

// curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "add", "params": [1,2], "id":2 }' http://localhost:3000
// curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "add", "params": { "b": 1, "a": 2 }, "id":2 }' http://localhost:3000

var math = {
    add: function(a, b, fn){
        fn(null, a + b);
    },
    sub: function(a, b){
        fn(null, a - b);
    }
};

// curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "time", "id":2 }' http://localhost:3000

var date = {
    time: function(fn){
        fn(null, new Date().toUTCString());
    }
};

var server = connect.createServer(
    connect.jsonrpc(math, date)
);

server.listen(3000);
console.log('Connect server listening on port 3000');