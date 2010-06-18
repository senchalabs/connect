## Redirect

The _redirect_ middleware provides `req.redirect()`, a utility method
for redirecting the request to a new _Location_. Example usage:

    exports.handle = function(req, res, next) {
	    req.redirect('http://google.com');
    }

Redirect also provides "magic" url maps, currently supported is _back_,
which will redirect to the _Referrer_ or _Referer_ headers:

	exports.handle = function(req, res, next) {
	    req.redirect('back');
	}

Optionally you may provide a status code as well, to replace the default of _302_:

	exports.handle = function(req, res, next) {
	    req.redirect('/foo', 301);
	}
