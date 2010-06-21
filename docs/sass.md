## Sass

The _sass_ middleware compiles and serves _*.sass_ files as css.
Sass itself is not bundled with Connect, so you must have it installed
and available to node.

    connect.createServer([
		{ provider: 'sass', root: __dirname + '/public' }
	]);

### Options

    root   Root directory from which to serve sass. Defaults to CWD
    match  RegExp used to match request urls. Defaults to /\.sass$/

### Environment Variables

    --sassRoot

### Links

  * [Sass.js](http://github.com/visionmedia/sass.js)