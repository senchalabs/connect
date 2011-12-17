
/**
 * # Connect
 *
 * Connect is a middleware framework for node,
 * shipping with over 11 bundled middleware and a rich choice of
 * [3rd-party middleware](https://github.com/senchalabs/connect/wiki).
 *
 *     var http = require('http');
 *
 *     var app = connect()
 *       .use(connect.logger('dev'))
 *       .use(connect.static('public'))
 *       .use(function(req, res){
 *         res.end('hello world\n');
 *       });
 *     
 *     http.createServer(app).listen(3000);
 *
 * Installation:
 * 
 *     $ npm install connect
 * 
 * API:
 *
 *  - general [API](proto.html)
 *
 * Middleware:
 *
 *  - [logger](middleware-logger.html) request logger with custom format support
 *  - [header](middleware-header.html) response header logger for debugging
 *  - [csrf](middleware-csrf.html) Cross-site request forgery protection
 *  - [basicAuth](middleware-basicAuth.html) basic http authentication
 *  - [bodyParser](middleware-bodyParser.html) extensible request body parser
 *  - [multipart](middleware-multipart.html) multipart/form-data parser
 *  - [json](middleware-json.html) application/json parser
 *  - [urlencodec](middleware-urlencodec.html) application/x-www-form-urlencoded parser
 *  - [cookieParser](middleware-cookieParser.html) cookie parser
 *  - [session](middleware-session.html) session management support with bundled [MemoryStore](middleware-session-memory.html)
 *  - [methodOverride](middleware-methodOverride.html) faux HTTP method support
 *  - [responseTime](middleware-responseTime.html) calculates response-time and exposes via X-Response-Time
 *  - [router](middleware-router.html) provides rich Sinatra / Express-like routing
 *  - [staticCache](middleware-staticCache.html) memory cache layer for the static() middleware
 *  - [static](middleware-static.html) streaming static file server supporting `Range` and more
 *  - [directory](middleware-directory.html) directory listing middleware
 *  - [vhost](middleware-vhost.html) virtual host sub-domain mapping middleware
 *  - [favicon](middleware-favicon.html) efficient favicon server (with default icon)
 *  - [limit](middleware-limit.html) limit the bytesize of request bodies
 *  - [profiler](middleware-profiler.html) request profiler reporting response-time, memory usage, etc
 *  - [query](middleware-query.html) automatic querystring parser, populating `req.query`
 *  - [errorHandler](middleware-errorHandler.html) flexible error handler
 *
 * Internals:
 *
 *  - connect [utilities](utils.html)
 *  - node monkey [patches](patch.html)
 *
 */