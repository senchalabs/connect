# Connect

Connect is a high performance middleware framework built by the combined forces of Tim Caswell ([creationix][]) and TJ Holowaychuk ([visionmedia][]) and the other skilled developers of [ExtJS][]. Connect takes the familiar concepts of Ruby's [Rack](http://rack.rubyforge.org/) and applies it to the asynchronous world of [node](http://nodejs.org);

ExtJS is releasing Connect under the very liberal MIT license in hopes that we can provide some level of leadership and stability for application frameworks to build on.

## Features

  * High performance api, with nearly no overhead.
  * Several bundled middleware implementations such as _log_, _static_, and _json-rpc_.
  * The _connect_ executable for daemonizing node, and Connect servers.

## Installation

    $ git clone git://github.com/extjs/Connect.git && cd Connect && sudo make install

## Documentation

View the man page:

    $ man connect

or view the HTML document:

    $ open docs/api.html

## Running Benchmarks

To run the benchmarks you must have ApacheBench, and gnuplot installed, then:

    $ make benchmark && make graphs && open results/graphs/*.png

## Testing

First update the git submodules, which includes
the [Expresso](http://github.com/visionmedia/expresso) TDD
framework:

    $ git submodule update --init

Then run the test suites located in _./test_ with the following command:

    $ make test

Run a single test, or use a custom glob pattern:

    $ make test TESTS=test/connect.test.js

[creationix]: http://github.com/creationix
[visionmedia]: http://github.com/visionmedia
[ExtJS]: http://www.extjs.com/
[Rack]: http://rack.rubyforge.org/
[Node.JS]: http://nodejs.org/