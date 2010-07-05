connect(1) -- node server runner
========================================

## Synopsis

    connect [-H|--host ADDR] [-p|--port NUM]
            [-n|--workers NUM] [-I|--include PATH]
            [-E|--env ENV] [-e|--eval CODE] [-C|--chdir PATH]
            [-c|--config PATH] [-P|--pidfile PATH]
            [-l|--logfile PATH] [-u|--user ID|USER] [-g|--group ID|GROUP]
            [-v|--verbose] [-V|--version] [-K|--no-color]
            [-h|--help] [--ENV VAL]
            start|stop|restart|status [PATH]

## Description

Connect is a dual purpose library, aiding in both rapid development, and deployment of node servers. Connect "middleware" can be stacked to create a robust application within minutes. The _connect_ executable supports launching of both regular `net.Server`, and `connect.Server` instances.
 
The connect executable supplies _init.d_ friendly _start_, _stop_, and _restart_ commands, and accept a direct path to the module meant to be run, otherwise defaults to trying both _app.js_ and _server.js_ in the current working directory.

Also to check the status of a process you may use the _status_ command, which
checks if the process is running.

## Executable Options

    -H, --host ADDR       Host address, defaults to INADDR_ANY
    -p, --port NUM        Port number, defaults to 3000
    -n, --workers NUM     Number of worker processes to spawn
    -I, --include PATH    Unshift the given path to require.paths
    -E, --env ENV         Set environment, defaults to "development"
    -e, --eval CODE       Evaluate the given string
    -C, --chdir PATH      Change to the given path
    -c, --config PATH     Load configuration module
    -P, --pidfile PATH    PID file, defaults to pids/connect.pid
    -l, --logfile PATH    Log file, defaults to logs/connect.log
    -u, --user ID|USER    Change user with setuid()
    -g, --group ID|GROUP  Change group with setgid()
    -v, --verbose         Display verbose output
    -V, --version         Output connect version
    -K, --no-color        Suppress colored terminal output
    -h, --help            Display help information
    --ENV VAL             Sets the given connect environment variable

## Supported Environment Variables

Currently the following environment variables may be set
via the `--ENV VAL` catchall. For example we can alter the log
format used via the command line with `connect --logFormat ":method :uri".

Boolean values may use strings such as _yes_, _no_, _true_, _false_.

    --logFormat STR           Custom log format
    --dumpExceptions BOOL     Dump exceptions to stderr
    --showErrorMessage BOOL   Show exception message in response (recommended for development only)
    --showErrorStack BOOL     Show exception stack trace (recommended for development only)
    --methodOverrideKey STR   Override the default method key of "_method"
    --compilerSrc PATH        Compiler source root directory
    --compilerDest PATH       Compiler destination directory

## Middleware Usage

Below is an example which shows usage of the _logger_ middleware bundled with Connect, as well as _staticProvder_.

    var connect = require('connect');

    module.exports = connect.createServer(
		connect.logger(),
		connect.staticProvider(__dirname + '/public')
    );

As shown above the module exports a `connect.Server` and does not call the `listen()` method directly. This allows other modules to "mount" this app, as well as allowing the _connect_ executable to control how the server is run.
 
If you prefer not to use _connect_, you can simply create a script executable by _node_, `require()` the app, then invoke `listen()`.

    #!/usr/bin/env node
    require('./app').listen();

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
    debug            Outputs debugging console to all html responses
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
    jsonrpc          JSON-RPC 2.0 support
    format           Populates req.format for urls such as "/products.json"
    repl             Read Evaluate Print Loop attached to "/tmp/connect.sock" for inspecting live servers 
    vhost            Virtual host support

### Middleware Documentation

To view middleware specific documentation execute:

    $ man connect-MIDDLEWARE

For example:

    $ man connect-bodyDecoder