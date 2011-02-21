## Static Provider

The _staticProvider_ middleware provides static file serving to the given _root_ directory defaulting to the **CWD**, for example:

    connect.createServer(
		connect.staticProvider(__dirname + '/public')
	);

Alternatively if specifying additional options:
    connect.createServer(
		connect.staticProvider({
		    root: __dirname + '/public',
		    exclude: /.*\/server\/.*/
		})
	);

### Options

    root            Root directory from which to serve static files.
    maxAge          Browser cache maxAge in milliseconds
    cache           When true cache files in memory indefinitely, until invalidated by
                    a conditional GET request. When given, maxAge will be derived from
                    this value.
    exclude         Regular expression used to prevent specific paths from being returned.

### Environment Variables

    --staticRoot