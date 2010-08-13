## Logger

The _logger_ middleware provides common log format support, as well as custom formats, below is the default usage:

    connect.createServer(
		connect.logger(),
	);

The logger also has built in buffering support to increase performance. When the `buffer` option is set to `true` it defaults to 1000 milliseconds, however you can specify your own duration. When using the `buffer` option log lines are not written to the stream immediately, they are buffered in an array, and flushed periodically.

    connect.createServer(
		connect.logger({ buffer: 2000 })
	);

A custom format can also be passed:

    connect.createServer(
		connect.logger({ format: ':method :url :response-time' })
    );

The following format tokens are currently available:

    :req[header]    Arbitrary request header, ex: req[Accept]
    :res[header]    Arbitrary response header, ex: res[Content-Type]
    :http-version   HTTP request version
    :response-time  Response time in milliseconds
    :remote-addr    Remote address
    :date           UTC date
    :method         Request method
    :url            Request url
    :referrer       Request referrer / referer
    :user-agent     User-Agent string
    :status         Response status

### Environment Variables

    --logFormat