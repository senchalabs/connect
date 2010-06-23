## Sass

The _sass_ middleware compiles _*.sass_ files as css, these files are
written to disk, and automatically re-compiled when altered. _sass_ itself does not
serve the file, it delegates to the _static_ middleware, therefore the _root_ option
should be accessible to _static_.

Sass itself is not bundled with Connect, so you must have it installed
and available to node.

    connect.createServer([
		{ provider: 'sass', root: __dirname + '/public' }
	]);

### Options

    root   Root directory from which to compile sass. Defaults to CWD

### Environment Variables

    --sassRoot

### Links

  * [Sass.js](http://github.com/visionmedia/sass.js)

### See Also

  * static