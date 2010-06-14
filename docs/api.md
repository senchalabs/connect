connect(1) -- node server runner
========================================

## Synopsis

    connect [-H|--host ADDR] [-p|--port NUM]
            [-n|--workers NUM] [-I|--include PATH]
            [-E|--env NAME] [-e|--eval CODE] [-C|--chdir PATH]
            [-c|--config PATH] [-P|--pidfile PATH]
            [-l|--logfile PATH] [-u|--user ID|NAME] [-g|--group ID|NAME]
            [-v|--verbose] [-K|--no-color] [-h|--help]
            [--ENV VAL]
            start|stop|restart|status [PATH]

## Description

Connect is a duel purpose library, aiding in both rapid development, and deployment of node servers. Connect "middleware" can be stacked to create a robust application within minutes. The _connect_ executable supports launching of both regular `net.Server`, and `connect.Server` instances.
 
The connect executable supplies _init.d_ friendly _start_, _stop_, and _restart_ commands, and accept a direct path to the module meant to be run, otherwise defaults to trying both _app.js_ and _server.js_ in the current working directory.

Also to check the status of a process you may use the _status_ command, which
checks if the process is running.

## Executable Options

    -H, --host ADDR      Host address, defaults to INADDR_ANY
    -p, --port NUM       Port number, defaults to 3000
    -n, --workers NUM    Number of worker processes to spawn
    -I, --include PATH   Unshift the given path to require.paths
    -E, --env NAME       Set environment, defaults to "development"
    -e, --eval CODE      Evaluate the given string
    -C, --chdir PATH     Change to the given path
    -c, --config PATH    Load configuration module
    -P, --pidfile PATH   PID file, defaults to pids/connect.pid
    -l, --logfile PATH   Log file, defaults to logs/connect.log
    -u, --user ID|NAME   Change user with setuid()
    -g, --group ID|NAME  Change group with setgid()
    -v, --verbose        Display verbose output
    -K, --no-color       Suppress colored terminal output
    -h, --help           Display help information
    --ENV VAL            Sets the given connect environment variable

## Supported Environment Variables

Currently the following environment variables may be set
via the `--ENV VAL` catchall. For example we can alter the log
format used via the command line with `connect --logFormat ":method :uri".

Boolean values may use strings such as "yes", "no", "true", "false".

  - logFormat
  - dumpExceptions
  - showErrorMessage
  - showErrorStack
  - methodOverrideKey
  - sassRoot
  - staticRoot

## Middleware

Connect middleware is divided into two concepts. First we have _filters_ which perform an action and allow lower middleware to respond to the request, secondly we have _providers_ which are conceptual "end-points", responding to the request without continuing down the stack.

## Middleware Usage

Below is an example which shows usage of the _log_ filter bundled with Connect, as well as the _static_ provider.

The keys `filter` and `provider` are used only as short-cuts to bundled middleware, to utilize a custom module we can assign a module's exports to the `module` key.

    module.exports = require('./lib/connect').createServer([
        { filter: 'log' },
        { module: require('path/to/custom/middleware') },
        { provider: 'static', root: __dirname + '/public' }
    ]);

As shown above the module exports a `connect.Server` and does not call the `listen()` method directly. This allows other modules to "mount" this app, as well as allowing the _connect_ executable to control how the server is run.
 
If you prefer not to use _connect_, you can simply create a script executable by _node_, `require()` the app, then invoke `listen()`.

    #!/usr/bin/env node
    require('./app').listen();

## Middleware Authoring

Middleware is essentially just an object, responding to a `handle()` method, the example below illustrates how simple it is to create, and utilize custom middleware.
 
First we define the `handle()` method, which accepts three arguments, _req_, _res_, and _next_. 

    var helloWorld = {
        handle: function(req, res, next){
            res.writeHead(200, { 'Content-Type: 'text/plain' });
            res.end('Hello World');
        }
    };

    require('connect').createServer([
        { module: helloWorld }
    ]);
    
The `next()` function passes control to the next middleware layer in the stack, and may optionally be passed an instanceof `Error`, at which time only `handleError()` methods may respond.
 
If you wish to pass an exception down the stack, you can invoke `next()` like below:
 
     if (someRequirementIsNotMet) {
         next(new Error('my requirement was not met!'));
     }

We can take this example further by "exporting" the `handle()` method, so that other libraries can simply `require('hello-world')`:
 
    # hello-world.js
    exports.handle = function(req, res, next){
        res.writeHead(200, { 'Content-Type: 'text/plain' });
        res.end('Hello World');
    };
    
    # app.js
    require('connect').createServer([
        { module: require('./hello-world') }
    ]);

If an exception was thrown, or is passesd to `next()`, middleware may define the `handleError()` method
in order to respond (or ignore) the exception. The `handleError()` method follows the same semantics as
`handle()`, for example:

    exports.handleError = function(err, req, res, next){
        // At any time we can call next() without
        // any arguments to eliminate exceptional status and
        // continue down the stack

        if (err.code === process.ENOENT) {
            // We dont want to deal with missing files
            // so pass the exception
            next(err);
        } else {
            // Respond with a message
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end('shit! im broken');
        }
    };

## Bundled Middleware

Connect ships with several helpful middleware modules,
the following are currently provided out of the box:

### Filters

    body-decoder     Buffers and parses _json_ and _urlencoded_ request bodies (extenable)
    conditional-get  Provides 304 _"Not Modified"_ support
    error-handler    Handles exceptions thrown, or passed through the stack
    debug            Outputs debugging console to all html responses
    format           Handles url path extensions or "formats"
    gzip             Compresses response bodies with gzip executable
    lint             Aids in middleware development
    log              Provides common logger support, and custom log formats
    method-override  Provides faux HTTP method support by using the _\_method_ key by default 
    response-time    Responds with the _X-Response-Time_ header in milliseconds

### Providers

    cache-manifest   Provides cache manifest for offline apps
    jsonrpc          Provides JSON-RPC 2.0 support
    sass             Provides auto-compilation of *.sass files
    static           Serves static files
    rest             Provides RESTful routing similar to Sinatra and Express


