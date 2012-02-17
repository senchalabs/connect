
/**
 * Connect is a middleware framework for node,
 * shipping with over 22 bundled middleware and a rich selection of
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
 * Middleware:
 *
 *  - [logger](logger.html) request logger with custom format support
 *  - [header](header.html) response header logger for debugging
 *  - [csrf](csrf.html) Cross-site request forgery protection
 *  - [basicAuth](basicAuth.html) basic http authentication
 *  - [bodyParser](bodyParser.html) extensible request body parser
 *  - [multipart](multipart.html) multipart/form-data parser
 *  - [json](json.html) application/json parser
 *  - [urlencodec](urlencodec.html) application/x-www-form-urlencoded parser
 *  - [cookieParser](cookieParser.html) cookie parser
 *  - [session](session.html) session management support with bundled [MemoryStore](session-memory.html)
 *  - [methodOverride](methodOverride.html) faux HTTP method support
 *  - [responseTime](responseTime.html) calculates response-time and exposes via X-Response-Time
 *  - [router](router.html) provides rich Sinatra / Express-like routing
 *  - [staticCache](staticCache.html) memory cache layer for the static() middleware
 *  - [static](static.html) streaming static file server supporting `Range` and more
 *  - [directory](directory.html) directory listing middleware
 *  - [vhost](vhost.html) virtual host sub-domain mapping middleware
 *  - [favicon](favicon.html) efficient favicon server (with default icon)
 *  - [limit](limit.html) limit the bytesize of request bodies
 *  - [profiler](profiler.html) request profiler reporting response-time, memory usage, etc
 *  - [query](query.html) automatic querystring parser, populating `req.query`
 *  - [errorHandler](errorHandler.html) flexible error handler
 *
 * Internals:
 *
 *  - connect [utilities](utils.html)
 *  - node monkey [patches](patch.html)
 */