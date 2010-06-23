## Compiler

The _compiler_ middleware compiles files that have not yet been compiled, or have been modified. Good examples of this are _sass_ and _less_, both of which compile to css. The compiled data is written to disk, and serving is delegated to the _static_ middleware, therefore the _root_ should be accessible (or the same) as _static_'s _root_ option. 

    connect.createServer([
		{ provider: 'compiler', root: __dirname + '/public', compile: ['css'] }
	]);

### Options

    root     Root directory from which to compile files. Defaults to CWD
    compile  Enabled compilers, currently supported are "sass", and "less".

### Environment Variables

    --compilerRoot

### Links

  * [Sass.js](http://github.com/visionmedia/sass.js)
  * [Less.js](http://github.com/cloudhead/less.js)

### See Also

  * static