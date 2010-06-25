## Method Override

The _methodOverride_ middleware checks `req.body._method` (by default) in order to swap out the http request method.
The _bodyDecoder_ middleware will populate `req.body` when a form is submitted, which when paired with
this middleware will allow the _router_ middleware to support RESTful forms.

### Options

    key   Defaults to _method

### Environment Variables

    --methodOverrideKey

### See Also

  * body-decoder