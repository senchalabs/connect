## Lint

The _lint_ middleware aids in middleware development, by performing basic cheques at boot, and during requests. This process currently checks that the:

  * first param of `handle()` is _req_ or _request_
  * second param of `handle()` is _res_ or _response_
  * third param of `handle()` is _next_
  * source of `handle()` to see if `next()` is called, or if the request is responded to
  * `method` property is always uppercase
  * `req.headers` is accessed with lowercase

The placement of _lint_ within the stack is important. It should sit below the middleware you are developing, in order to validate during runtime, however it can also simply be placed at the bottom of the stack to validate all middleware statically.

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
	Warning: layer method uppercase:4 Request method is no longer uppercase, got get
	