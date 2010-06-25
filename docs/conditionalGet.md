## Conditional GET

The _conditionalGet_ middleware supports conditional GET requests, which validates the "freshness" of a response body. Currently supports:

  * _If-Modified-Since_. When a response status is _200_, and _Last-Modified_ less than or equal to this time, the response body and _Content-*_ headers will be stripped, responding with 304 "Not Modified".

  * _If-None_Match_. Performs a similar validation, however compares the _ETag_ for equality.