## JSON-RPC

The _jsonrpc_ middleware provides JSON-RPC 2.0 support. Below is an example exposing the _add_ and _sub_ methods:

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

	var date = {
	    time: function(){
	        this(null, new Date().toUTCString());
	    }
	};

	module.exports = Connect.createServer(
	    Connect.jsonrpc(math, date)
	);

The value of _this_ becomes the async callback function. When you wish to pass an exception simply invoke `this(err)`, or pass the error code `this(jsonrpc.INVALID_PARAMS)`. Other `this(null, result)` will respond with the given results.

### Features

  * async support
  * batch request support
  * variable argument length
  * named parameter support
