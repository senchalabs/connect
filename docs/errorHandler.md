## Error Handler

The _errorHandler_ middleware responds to exceptions passed or caught from within middleware above it, according to the options shown below.

    connect.createServer(
	    function(req, res, next){
		    throw new Error('ahhhh!');
	    },
		connect.errorHandler({ dumpExceptions: true })
	);

By default the response of _errorHandler_ is 500 'Internal Server Error'. If _showStack_ is true, then Connect decides how to respond based on the _Accept_ request header:

    text/html         Outputs an html version of the stack trace
    application/json  Outputs json { 'error': { 'message': ... }}
    otherwise         Outputs plain text stack trace

### Options

    showMessage     Show the exception message only  
    showStack       Show the exception message and stack trace
    dumpExceptions  Output exception stack traces to stderr (does not re-throw)

### Environment Variables

    --showErrorMessage
    --showErrorStack
    --dumpExceptions