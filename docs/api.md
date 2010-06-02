connect(1) -- node server runner
========================================

## Synopsis

    connect [-H|--host ADDR] [-p|--port NUM]
            [-D|--daemonize] [-I|--include PATH]
            [-E|--env NAME] [-e|--eval CODE] [-C|--chdir PATH]
            [-c|--config PATH] [-P|--pidfile PATH]
            [-l|--logfile PATH] [-u|--user ID] [-g|--group ID]
            [-v|--verbose] [-K|--no-color] [-h|--help]
            start|stop|restart [PATH]

## Description

Connect is a duel purpose library, aiding in both rapid development, and deployment of node servers. Connect "middleware" can be stacked to create a robust application within minutes. The _connect_ executable supports launching of both regular `net.Server`, and `connect.Server` instances.
 
The connect executable supplies _init.d_ friendly _start_, _stop_, and _restart_ commands, and accept a direct path to the module meant to be run, otherwise defaults to trying both _app.js_ and _server.js_ in the current working directory.

## Executable Options

    -H, --host ADDR      Host address, defaults to INADDR_ANY
    -p, --port NUM       Port number, defaults to 3000
    -D, --daemonize      Daemonize the server process
    -I, --include PATH   Unshift the given path to require.paths
    -E, --env NAME       Set environment, defaults to "development"
    -e, --eval CODE      Evaluate the given string
    -C, --chdir PATH     Change to the given path
    -c, --config PATH    Load configuration module
    -P, --pidfile PATH   PID file, defaults to pids/connect.pid
    -l, --logfile PATH   Log file, defaults to logs/connect.log
    -u, --user ID        Change user with setuid()
    -g, --group ID       Change group with setgid()
    -v, --verbose        Display verbose output
    -K, --no-color       Suppress colored terminal output
    -h, --help           Display help information

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
 
First we define the `handle()` method, which accepts four arguments, _err_, _req_, _res_, and _next_. 
 
If an exception occurred, it is passed, it is up to your middleware to decide whether or not to simply ignore the error and pass it down the middleware stack, or to perform an action based on the exception. In our case we do not want to deal with the error directly, we simply invoke the `next()` function, passing it down the stack (potentially to the _error-handler_ middleware).
 
    var helloWorld = {
        handle: function(err, req, res, next){
            if (err) {
              next();
            } else {
              res.writeHead(200, { 'Content-Type: 'text/plain' });
              res.end('Hello World');
            }
        }
    };

    require('connect').createServer([
        { module: helloWorld }
    ]);
    
The `next()` function accepts the same four arguments that our `handle()` method does, however all of them are optional. For example if an _err_ is present, and we invoke `next()` as shown above, the next middleware will receive the _err_ object (not "undefined"), and the same _req_, and _res_ objects are passed as well.
 
If you wish to pass an exception down the stack, you can invoke `next()` like below:
 
     if (someRequirementIsNotMet) {
       next(new Error('my requirement was not met!'));
     }

We can take this example further by "exporting" the `handle()` method, so that other libraries can simply `require('hello-world')`:
 
    # hello-world.js
    exports.handle = function(err, req, res, next){
            if (err) {
              next();
            } else {
              res.writeHead(200, { 'Content-Type: 'text/plain' });
              res.end('Hello World');
            }
        }
    };
    
    # app.js
    require('connect').createServer([
        { module: require('./hello-world') }
    ]); 