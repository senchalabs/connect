# Connect

Connect is a high performance middleware framework built by the combined forces of TJ Holowaychuk ([visionmedia][]) and Tim Caswell ([creationix][]). Connect takes the familiar concepts of Ruby's [Rack](http://rack.rubyforge.org/) and applies it to the asynchronous world of [node](http://nodejs.org).

## Bundled Middleware

  * basicAuth - basic auth support
  * bodyDecoder - body parser (json and x-form-urlencoded)
  * logger - customizable request logger
  * compiler - statically compiles languages such as _sass_ and _less_ down to their native form
  * staticProvider - static file server with http caching
  * favicon - serve a default favicon, or the one provided
  * methodOverride - provide HTTP method overriding support
  * router - restful routing capabilities
  * session - abstract session support with default `MemoryStore`
  * vhost - virtual host support
  * cacheManifest

## Hello World

The simplest connect app looks just like `http.Server` instances from node.  In fact `connect.Server` inherits from `http.Server`.

    var connect = require('connect');

    var server = connect.createServer(function(req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello World');
    });

    server.listen(3000);

Then if you want to add in a pre-built feature like logging just add it to the `createServer()` call.

    var server = connect.createServer(
      connect.logger(),
      function(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World');
      }
    );

Or the progressive form of middleware usage via `Server#use()`:

    var server = connect.createServer();
    
    server.use(connect.logger());
    server.use(function(req, res){
      res.writeHead(200);
      res.end('Hello World');
    });

## Installation

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