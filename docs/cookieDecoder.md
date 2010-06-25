## Cookie Decoder

The _cookieDecoder_ middleware parses the _Cookie_ header when present, and populates `req.cookies`:

    connect.createServer(
		connect.cookieDecoder()
	]);

## See Also

  * session