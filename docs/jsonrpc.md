## JSON-RPC

The _jsonrpc_ middleware provides JSON-RPC 2.0 support. Below is an example exposing the _add_ and _sub_ methods:

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

The value of _this_ becomes the async callback function. When you wish to pass an exception simply invoke `this(err)`, or pass the error code `this(jsonrpc.INVALID_PARAMS)`. Other `this(null, result)` will respond with the given results.

To perform a request execute:

    $ curl -H "Content-Type: application/json" -d '{ "jsonrpc": "2.0", "method": "add", "params": [1,2], "id":2 }' http://localhost:3000

### Features

  * async support
  * batch request support
  * variable argument length
  * named parameter support
