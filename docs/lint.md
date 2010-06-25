## Lint

The _lint_ middleware aids in middleware development, by performing basic cheques at boot, and during requests. This process currently checks that the:

  * first param of `handle()` is _req_ or _request_
  * second param of `handle()` is _res_ or _response_
  * third param of `handle()` is _next_
  * source of `handle()` to see if `next()` is called, or if the request is responded to
  * `req.headers` is accessed with lowercase

### Example

    var Server = module.exports = connect.createServer(
	    // No named params
	    function params(){
	        arguments[2]();
	    },
	    // Does not call next AND does not respond
	    function hang(req, res, next){
	        // Call foo() instead so
	        // that our demo can still function.
	        var foo = next;
	        foo();

	        // All good
	        var ct = req.headers['content-type'];
	    },
	    function allGood(req, res, next){
	        // All good
	        next();
	    },
	    function reqHeaders(req, res, next){
	        // Request headers are always normalized as
	        // lowercased by ryan's http parser.
	        var ct = req.headers['Content-Type'];
	        next();
	    },
	    function methodUppercase(req, res, next){
	        // req.method should be uppercase
	        req.method = 'get';
	        next();
	    }
	);

	Server.use('/', connect.lint(Server));

### Sample Output

    Warning: layer params:0 First parameter should be named req or request, but is undefined
	Warning: layer params:0 Second parameter should be named res or response, but is undefined
	Warning: layer params:0 Third parameter should be named next, but is undefined
	Warning: layer params:0 Does not seem to call next(), or respond to the request
	Warning: layer hang:1 Does not seem to call next(), or respond to the request
	Warning: layer req.headers:3 Request headers are lowercased, seems to be accessed with capitals

	0) params:
	    function (){
	        arguments[2]();
	    }

	1) hang:
	    function (req, res, next){
	        // Call foo() instead so
	        // that our demo can still function.
	        var foo = next;
	        foo();

	        // All good
	        var ct = req.headers['content-type'];
	    }

	3) req.headers:
	    function (req, res, next){
	        // Request headers are always normalized as
	        // lowercased by ryan's http parser.
	        var ct = req.headers['Content-Type'];
	        next();
	    }
	