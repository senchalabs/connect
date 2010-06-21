## Conditional GET

The _conditional-get_ middleware currently supports _If-Modified-Since_. When a request status is _200_, and _Last-Modified_ matches _If-Modified_-Since_, then the response body and _Content-*_ headers will be stripped, responding with 304 "Not Modified".