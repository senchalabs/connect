connect(1) -- high performance middleware framework for node
============================================================

Connect is a high performance middleware framework for [node](http://nodejs.org) featuring
robust middleware for serving static files, advanced routing, cookie and session implementations,
error handling and much more.

## Middleware Usage

Below is an example which shows usage of the _logger_ middleware bundled with Connect, as well as _staticProvder_.

    var connect = require('connect');

    var server = connect.createServer(
		connect.logger(),
		connect.staticProvider(__dirname + '/public')
    );

    server.listen(3000);

## Middleware Authoring

Connect middleware is simply a function which accepts the _request_, _response_ objects. Optionally
the third parameter _next_ can be used to continue down the middleware stack. For example below is
a middleware layer that simply responds with "hello world".

    function helloWorld(req, res) {
	    res.writeHead(200, { 'Content-Type': 'text/plain' });
	    res.end('hello world');
    }

    connect.createServer(helloWorld).listen(3000);

Lets say we now have some middleware that will require a setup step, this can be done by returning a closure:

    function respond(msg) {
	    msg = msg || 'hello world';
	    return function(req, res) {
		    res.writeHead(200, { 'Content-Type': 'text/plain' });
		    res.end(msg);
   	    }
    }

    connect.createServer(respond('wahoo')).listen(3000);

To pass control to the next middleware layer, we may call the `next()` function with an optional instanceof `Error`.
Middleware with four parameters is an error handling middleware, the `err` object can then be logged, used to issue a response, ignored, etc.

    function break(req, res, next) {
	    // Exceptions thrown will be automatically passed to next()
	    // however for custom exceptions / async exceptions you may pass them
	    next(new Error('something broke!'));
    }

    function errorHandler(err, req, res, next) {
	    res.writeHead(500, { 'Content-Type': 'text/plain' });
	    res.end(err.stack);
    }

    connect.createServer(break, errorHandler).listen(3000);

To make your middleware available to others, typically you write a module, and export the function itself:

    // delay.js
    module.exports = function(ms){
	    ms = ms || 1000;
	    return function(req, res, next){
		    setTimeout(next, ms);
 	    } 
    };

   // app.js
   // delay one second before continuing down the stack
   connect.createServer(require('./delay')(1000)).listen(3000);

## Bundled Middleware

Connect ships with several helpful middleware modules,
the following are currently provided out of the box:

    bodyDecoder      Buffers and parses json and urlencoded request bodies (extenable)
    conditionalGet   Provides 304 "Not Modified" support
    errorHandler     Handles exceptions thrown, or passed through the stack
    format           Handles url path extensions or "formats"
    gzip             Compresses response bodies with gzip executable
    lint             Aids in middleware development
    logger           Provides common logger support, and custom log formats
    methodOverride   Provides faux HTTP method support by using the "_method" key by default 
    responseTime     Responds with the X-Response-Time header in milliseconds
    redirect         Provides req.redirect() with "magic" urls, ex: req.redirect("back")
    compiler         Supports arbitrary static compilation of files, currently supports less and sass.
    cacheManifest    Provides cache manifest for offline apps
    jsonrpc          Provides JSON-RPC 2.0 support
    staticProvider   Serves static files
    router           Provides a feature rich routing API similar to Sinatra and Express
    cookieDecoder    Provides cookie parsing support
    session          Provides session support
    cache            Provides memory caching
    pubsub           Publish subscribe messaging support
    repl             Read Evaluate Print Loop attached to "/tmp/connect.sock" for inspecting live servers 
    vhost            Virtual host support

### Middleware Documentation

To view middleware specific documentation execute:

    $ man connect-MIDDLEWARE

For example:

    $ man connect-bodyDecoder