## Sass

The _sass_ middleware compiles and serves _*.sass_ files as css.
Sass itself is not bundled with Connect, so you must have it installed
and available to node.

    connect.createServer([
		{ provider: 'sass', root: __dirname + '/public' }
	]);

### Environment Variables

    --sassRoot

### Links

  * [Sass.js](http://github.com/visionmedia/sass.js)