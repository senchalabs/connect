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

 `Connect` is a duel purpose library, aiding in both rapid development,
 and deployment of node servers. Connect "middleware" can be stacked
 to create a robust application within minutes. The _connect_ executable
 supports launching of both regular `net.Server`, and `connect.Server` instances.
 
 _connect_ supplies _init.d_ friendly _start_, _stop_, and _restart_ commands,
 and accept a direct path to the module meant to be run, otherwise defaults
 to trying both _app.js_ and _server.js_ in the current working directory.

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

 Connect middleware is divided into two concepts. First we have _filters_
 which perform an action and allow lower middleware to respond
 to the request, secondly we have _providers_ which are conceptual "end-points",
 responding to the request without continuing down the stack.


## Middleware Usage

 Below is an example which shows usage of the _log_ filter
 bundled with `Connect`, as well as the _static_ provider.

 The keys _filter_ and _provider_ are used only as short-cuts
 to bundled middleware, to utilize a custom module we can
 assign a module's exports to the `module` key.

    module.exports = require('./lib/connect').createServer([
        { filter: 'log' },
        { module: require('path/to/custom/middleware') },
        { provider: 'static', root: __dirname + '/public' }
    ]);

 As shown above the module exports a `connect.Server` and
 does not call the `listen()` method directly. This allows other
 modules to "mount" this app, as well as allowing the _connect_
 executable to control how the server is run.
 
 If you prefer not to use _connect_, you can simply create a script
 executable by _node_, `require()` the app, then invoke `listen()`.

    #!/usr/bin/env node
    require('./app').listen();