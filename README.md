

## Testing

First update the git submodules, which include
the [Expresso](http://github.com/visionmedia/expresso) TDD
framework:

    $ git submodule update --init

Then run the test suites located in _./test_ with the following command:

    $ make test

Run a single test, or use a custom glob pattern:

    $ make test TESTS=test/connect.test.js