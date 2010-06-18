## Static

The _static_ middleware provides static file serving to the given _root_ directory, for example:

    connect.createServer([
		{ provider: 'static', root: __dirname + '/public' }
	]);

### Environment Variables

    --staticRoot