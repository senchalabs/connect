## Static Provider

The _staticProvider_ middleware provides static file serving to the given _root_ directory defaulting to the **CWD**, for example:

    connect.createServer(
		connect.staticProvider(__dirname + '/public')
	);

### Environment Variables

    --staticRoot