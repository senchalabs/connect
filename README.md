# Connect

Connect is a middleware framework built by the combined forces of Tim Caswell ([creationix][]) and TJ Holowaychuk ([visionmedia][]) and the other skilled developers of [ExtJS][].  Connect is a layer that sits between node and an http application framework.  It's much like [Rack][] of the ruby world, but designed from the ground up with [Node.JS][] in mind.

ExtJS is releasing Connect under the very liberal MIT license in hopes that we can provide some level of leadership and stability for application frameworks to build on.

This library is aimed at experienced developers - typical application developers will consume middleware far more often than writing it. In particular, we would like the Node community to standardize on this.

## Goals

  * Provide a consistent framework for developers to create middleware
  * Gracefully handle issues arising from asynchronous middleware
  * Provide clean API for creating middleware
  * Provide useful subset of bundled middleware layers - gzip, content-length, caching, cookie decoding, logging, response time

## Non-Goals

  * Data persistence layer
  * View layer

## Usage

To learn the API, I'll go through building a simple app in Connect.  First a plain hello world app:

    var Connect = require("connect");

    Connect.createServer([
        {module: {handle: function (err, req, res, next) {
            res.simpleBody(200, "Hello World");
        }}}
    ]).listen();

Connect server inherits from node's http server, so the API should look familiar.  The difference is that instead of taking a single callback for each request, it expects a stack of middleware layers.

### Layers

Connect comes built-in with several middleware layers that are split into two categories.  They are called filters and providers.  A filter is a layer that modifies an http request or it's corresponding response.  A provider is the endpoint that takes the request and generates the response.

Think of it as the layers to an onion and each HTTP request enters the onion at the outermost layer and travels in till a layer reflects it as a response.  The response then goes through the same layers in reverse order.

Layer objects can have four properties.  They are:

  * `module` - A reference to a raw user-specified middleware layer module.
  * `filter` - The name of a built-in filter middleware to use
  * `provider` - The name of a built-in provider middleware to use.
  * `route` - An optional filter on the url for which routes to apply the middleware to.  Also the url given to the layer is relative to this route.
  * `param` - The optional configuration parameter to pass to the `setup` function of the layer.
  * `params` - If you want to pass more than one parameter, give this an array and they will be passed in as individual parameters.

Here are some sample middleware layer configurations:

    // Log all HTTP responses to the terminal in Common Log Format.
    {filter: "log"}
    // Gzip the response body automatically.
    {filter: "gzip"}
    // Serve up all files in the public folder as static resources.
    {provider: "static", param: __dirname + "/public"}
    // Use a session for all requests to the admin subfolder.
    {filter: "session", route: "/admin"}
    // Make sure the user is authenticated for the secret and important
    // routes.
    {filter: "authentication", route: ["/secret", "/important"], param: require('./auth')},

### Examples

See the example apps and the included test suite for more through code examples.  More will come soon.

## Testing

First update the git submodules, which include
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