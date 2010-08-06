## JSON-RPC

The _jsonrpc_ middleware provides JSON-RPC 2.0 support. Below is an example exposing the _add_ and _sub_ methods:

	var math = {
	    add: function(a, b, fn){
	        fn(null, a + b);
	    },
	    sub: function(a, b, fn){
	        fn(null, a - b);
	    }
	};

	var date = {
	    time: function(fn){
	        fn(null, new Date().toUTCString());
	    }
	};

	connect.createServer(
	    connect.jsonrpc(math, date)
	);

When you wish to pass an exception simply invoke `fn(err)`, or pass the error code `fn(jsonrpc.INVALID_PARAMS)`. Otherwise `fn(null, result)` will respond with the given results.

### Features

  * async support
  * batch request support
  * variable argument length
  * named parameter support
