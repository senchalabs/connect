## Rest

The _rest_ middleware provides a RESTful routing api similar to that of Sinatra and Express.

	function user(app) {
		app.get('/users/(all.:format?)?', function(req, res){
			// populates req.format
	        // ex:
	        //   GET /users
	        //   GET /users/all
	        //   GET /users/all.json
	        //   GET /users/all.xml
		});
		
		app.get('/users/:id.:format?': function(req, res){
			// populates req.format
		    // populates params.id
		    // ex:
		    //   GET /user/5
		    //   GET /user/5.json
		    //   GET /user/5.xml
		});
		
		app.put('/user/:id', function(req, res, params){
			// populates params.id
			// ex:
			//   PUT /user/2
		});
		
		app.del('/user/:id/file/*', function(req, res, params){
			// populates params.id
			// populates params.splat[0]
			// ex:
			//   PUT /user/4/file/javascripts/jquery.js
			//   PUT /user/4/file/stylecss
		});
	}

    connect.createServer([
	    { provider: 'rest', app: user }
	]);

Those of you looking for _PUT_ and _DELETE_ support may want to take a look at the _method-override_ middleware.

### See Also

  * method-override