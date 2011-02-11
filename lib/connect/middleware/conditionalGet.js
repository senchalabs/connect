
/*!
 * Connect - conditionalGet
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Conditional GET request support.
 *
 * @return {Function}
 * @api public
 */

module.exports = function conditionalGet(){
  return function conditionalGet(req, res, next) {
    if (!isConditionalGet(req)) return next();

    var since = req.headers['if-modified-since']
      , oldEtag = req.headers['if-none-match']
      , writeHead = res.writeHead
      , write = res.write
      , end = res.end;

    since = since && Date.parse(since).valueOf();

    res.writeHead = function (code, headers) {
      var lastModified = headers['Last-Modified']
        , etag = headers['ETag'];

      lastModified = lastModified && Date.parse(lastModified).valueOf();

      // If there is no match, then move on.
      if (!(code === 200 &&
            ((since && lastModified === since) || (etag && oldEtag === etag))
         )) {
        res.writeHead = writeHead;
        res.writeHead(code, headers);
        return;
      }

      // Ignore writes
      res.write = function () {};

      res.end = function () {
        // Put the original functions back on.
        res.writeHead = writeHead;
        res.write = write;
        res.end = end;

        // Filter out any Content based headers since there is no
        // content.
        var newHeaders = {};
        Object.keys(headers).forEach(function (key) {
          if (key.indexOf('Content') < 0) {
            newHeaders[key] = headers[key];
          }
        });
        res.writeHead(304, newHeaders);
        res.end();
      };
    };

    next();
  };
};

/**
 * Check if `req` is a conditional __GET__.
 *
 * @param {ServerRequest} req
 * @return {Boolean}
 * @api private
 */

function isConditionalGet(req) {
  return 'GET' == req.method
    && (req.headers['if-modified-since'] || req.headers['if-none-match']);
}
