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

 Connect is a node server runner, supporting both regular **net.Server**,
 and **connect.Server** instances. The _connect_ executable aids in deployment
 and daemonization of the server.
 
 Connect supplies _init.d_ friendly _start_, _stop_, and _restart_ commands,
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
