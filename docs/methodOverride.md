## Method Override

The _method-override_ checks `req.body._method` (by default) in order to swap out the http request method.
The _body-decoder_ middleware will populate `req.body` when a form is submitted, which when paired with
this middleware will allow the _rest_ middleware to support RESTful forms.

### Options

    key   Defaults to _method

### Environment Variables

    --methodOverrideKey

### See Also

  * body-decoder