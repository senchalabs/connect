# Connect

Connect is a high performance middleware framework built by the combined forces of Tim Caswell ([creationix][]) and TJ Holowaychuk ([visionmedia][]) and the other skilled developers of [Sencha][]. Connect takes the familiar concepts of Ruby's [Rack](http://rack.rubyforge.org/) and applies it to the asynchronous world of [node](http://nodejs.org).

ExtJS is releasing Connect under the very liberal MIT license in hopes that we can provide some level of leadership and stability for application frameworks to build on.

## Features

  * High performance api, with nearly no overhead.
  * Several bundled middleware implementations such as _log_, _static_, and _json-rpc_.

## Hello World

The simplest connect app looks just like `http.Server` instances from node.  In fact `Connect.Server` inherits from `http.Server`.

    var Connect = require('connect');

    var server = Connect.createServer(function(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World');
    });

    server.listen(3000);

Then if you want to add in a pre-built feature like logging just add it to the `createServer()` call.

    var server = Connect.createServer(
      Connect.logger(),
      function(req, res) {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Hello World');
      }
    );

It's that simple.

## Installation

Via curl / sh:

    $ curl -# http://github.com/senchalabs/connect/raw/master/install.sh | sh

Via git (or downloaded tarball):

    $ git clone git://github.com/senchalabs/connect.git && cd connect && make install

Via [npm](http://github.com/isaacs/npm):

    $ npm install connect

## Documentation

View the man page:

    $ man connect

View the HTML document:

    $ open docs/index.html

View the online HTML documentation visit [http://senchalabs.github.com/connect](http://senchalabs.github.com/connect).

View one of several examples located within [./examples](http://github.com/senchalabs/connect/tree/master/examples/).

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
[Sencha]: http://www.sencha.com/
[Rack]: http://rack.rubyforge.org/
[Node.JS]: http://nodejs.org/

## License 

(The MIT License)

Copyright (c) 2010 Sencha Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.