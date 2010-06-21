## Conditional GET

The _conditional-get_ middleware supports the _If-Modified-Since_ request header. When a request status is _200_, and _Last-Modified_ matches _If-Modified_-Since_, then the response body and _Content-*_ headers will be stripped, responding with 304 "Not Modified".