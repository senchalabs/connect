## Less

The _less_ middleware compiles and serves _*.less_ files as css.
Less itself is not bundled with Connect, so you must have it installed
and available to node.

    connect.createServer([
		{ provider: 'less', root: __dirname + '/public', match: /\.css$/ }
	]);

### Options

    root   Root directory from which to serve sass. Defaults to CWD
    match  RegExp used to match request urls. Defaults to /\.less$/

### Environment Variables

    --lessRoot

### See Also

  * sass

### Links

  * [Less.js](http://github.com/cloudhead/less.js)