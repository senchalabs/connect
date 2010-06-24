
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

// curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "add", "params": [1,2], "id":2 }' http://localhost:3000
// curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "add", "params": { "b": 1, "a": 2 }, "id":2 }' http://localhost:3000

var math = {
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
};

// curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "time", "id":2 }' http://localhost:3000

var date = {
    time: function(){
        this(null, new Date().toUTCString());
    }
};

module.exports = Connect.createServer(
    Connect.jsonrpc(math, date)
);