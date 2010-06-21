## Cookie

The _cookie_ middleware parses the _Cookie_ header when present, and populates `req.cookies`:

    connect.createServer([
		{ filter: 'cookie' }
	]);

## See Also

  * session