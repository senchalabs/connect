## Rest

The _router_ middleware provides a routing API similar to that of Sinatra and Express.

	function user(app) {
		app.get('/users/(all.:format?)?', function(req, res, next){
			// populates req.format
	        // ex:
	        //   GET /users
	        //   GET /users/all
	        //   GET /users/all.json
	        //   GET /users/all.xml
		});
		
		app.get('/users/:id.:format?': function(req, res, next){
			// populates req.format
		    // populates req.params.id
		    // ex:
		    //   GET /user/5
		    //   GET /user/5.json
		    //   GET /user/5.xml
		});
		
		app.put('/user/:id', function(req, res, next){
			// populates req.params.id
			// ex:
			//   PUT /user/2
		});
		
		app.del('/user/:id/file/*', function(req, res, next){
			// populates req.params.id
			// populates req.params[0]
			// ex:
			//   PUT /user/4/file/javascripts/jquery.js
			//   PUT /user/4/file/stylecss
		});
	}
	
	function commits(app) {
		// RegExps too!
		app.get(/\/commit\/(\w+)\.\.(\w+)\/?/i, function(req, res, next){
			// populates req.params[0] with first capture group
			// populates req.params[1] with second capture group
			// ex:
			//   GET /commit/kj4k..d3sdf
        });
	}

    connect.createServer(
		connect.router(user),
		connect.router(commits),
	);

Those of you looking for _PUT_ and _DELETE_ support may want to take a look at the _methodOverride_ middleware.

### See Also

  * methodOverride