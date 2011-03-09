
1.0.6 / 2011-03-09 
==================

  * Fixed `res.setHeader()` patch, preserve casing

1.0.5 / 2011-03-09 
==================

  * Fixed; `logger()` using `req.originalUrl` instead of `req.url`

1.0.4 / 2011-03-09 
==================

  * Added `res.charset`
  * Added conditional sessions example
  * Added support for `session.ignore` to be replaced. Closes #227
  * Fixed `Cache-Control` delimiters. Closes #228

1.0.3 / 2011-03-03 
==================

  * Fixed; `static.send()` invokes callback with connection error

1.0.2 / 2011-03-02 
==================

  * Fixed exported connect function
  * Fixed package.json; node ">= 0.4.1 < 0.5.0"

1.0.1 / 2011-03-02 
==================

  * Added `Session#save(fn)`. Closes #213
  * Added callback support to `connect.static.send()` for express
  * Added `connect.static.send()` "path" option
  * Fixed content-type in `static()` for _index.html_

1.0.0 / 2011-03-01 
==================

  * Added `stack`, `message`, and `dump` errorHandler option aliases
  * Added `req.originalMethod` to methodOverride
  * Added `favicon()` maxAge option support
  * Added `connect()` alternative to `connect.createServer()`
  * Added new [documentation](http://senchalabs.github.com/connect)
  * Added Range support to `static()`
  * Added HTTPS support
  * Rewrote session middleware. The session API now allows for
    session-specific cookies, so you may alter each individually.
    Click to view the new [session api](http://senchalabs.github.com/connect/middleware-session.html).
  * Added middleware self-awareness. This helps prevent
    middleware breakage when used within mounted servers.
    For example `cookieParser()` will not parse cookies more
    than once even when within a mounted server.  
  * Added new examples in the `./examples` directory
  * Added [limit()](http://senchalabs.github.com/connect/middleware-limit.html) middleware
  * Added [profiler()](http://senchalabs.github.com/connect/middleware-profiler.html) middleware
  * Added [responseTime()](http://senchalabs.github.com/connect/middleware-responseTime.html) middleware
  * Renamed `staticProvider` to `static`
  * Renamed `bodyDecoder` to `bodyParser`
  * Renamed `cookieDecoder` to `cookieParser`
  * Fixed ETag quotes. [reported by papandreou]
  * Fixed If-None-Match comma-delimited ETag support. [reported by papandreou]
  * Fixed; only set req.originalUrl once. Closes #124
  * Fixed symlink support for `static()`. Closes #123

0.5.10 / 2011-02-14 
==================

  * Fixed SID space issue. Closes #196
  * Fixed; proxy `res.end()` to commit session data
  * Fixed directory traversal attack in `staticProvider`. Closes #198

0.5.9 / 2011-02-09 
==================

  * qs >= 0.0.4

0.5.8 / 2011-02-04 
==================

  * Added `qs` dependency
  * Fixed router race-condition causing possible failure
    when `next()`ing to one or more routes with parallel
    requests

0.5.7 / 2011-02-01 
==================

  * Added `onvhost()` call so Express (and others) can know when they are
  * Revert "Added stylus support" (use the middleware which ships with stylus)
  * Removed custom `Server#listen()` to allow regular `http.Server#listen()` args to work properly
  * Fixed long standing router issue (#83) that causes '.' to be disallowed within named placeholders in routes [Andreas Lind Petersen]
  * Fixed `utils.uid()` length error [Jxck]
mounted

0.5.6 / 2011-01-23 
==================

  * Added stylus support to `compiler`
  * _favicon.js_ cleanup
  * _compiler.js_ cleanup
  * _bodyDecoder.js_ cleanup

0.5.5 / 2011-01-13 
==================

  * Changed; using sha256 HMAC instead of md5. [Paul Querna]
  * Changed; generated a longer random UID, without time influence. [Paul Querna]
  * Fixed; session middleware throws when secret is not present. [Paul Querna]

0.5.4 / 2011-01-07 
==================

  * Added; throw when router path or callback is missing
  * Fixed; `next(err)` on cookie parse exception instead of ignoring
  * Revert "Added utils.pathname(), memoized url.parse(str).pathname"

0.5.3 / 2011-01-05 
==================

  * Added _docs/api.html_
  * Added `utils.pathname()`, memoized url.parse(str).pathname
  * Fixed `session.id` issue. Closes #183
  * Changed; Defaulting `staticProvider` maxAge to 0 not 1 year. Closes #179
  * Removed bad outdated docs, we need something new / automated eventually

0.5.2 / 2010-12-28 
==================

  * Added default __OPTIONS__ support to _router_ middleware

0.5.1 / 2010-12-28 
==================

  * Added `req.session.id` mirroring `req.sessionID`
  * Refactored router, exposing `connect.router.methods`
  * Exclude non-lib files from npm
  * Removed imposed headers `X-Powered-By`, `Server`, etc

0.5.0 / 2010-12-06 
==================

  * Added _./index.js_
  * Added route segment precondition support and example
  * Added named capture group support to router

0.4.0 / 2010-11-29 
==================

  * Added `basicAuth` middleware
  * Added more HTTP methods to the `router` middleware

0.3.0 / 2010-07-21
==================

  * Added _staticGzip_ middleware
  * Added `connect.utils` to expose utils
  * Added `connect.session.Session`
  * Added `connect.session.Store`
  * Added `connect.session.MemoryStore`
  * Added `connect.middleware` to expose the middleware getters
  * Added `buffer` option to _logger_ for performance increase
  * Added _favicon_ middleware for serving your own favicon or the connect default
  * Added option support to _staticProvider_, can now pass _root_ and _lifetime_.
  * Added; mounted `Server` instances now have the `route` property exposed for reflection
  * Added support for callback as first arg to `Server#use()`
  * Added support for `next(true)` in _router_ to bypass match attempts
  * Added `Server#listen()` _host_ support
  * Added `Server#route` when `Server#use()` is called with a route on a `Server` instance
  * Added _methodOverride_ X-HTTP-Method-Override support
  * Refactored session internals, adds _secret_ option
  * Renamed `lifetime` option to `maxAge` in _staticProvider_
  * Removed connect(1), it is now [spark(1)](http://github.com/senchalabs/spark)
  * Removed connect(1) dependency on examples, they can all now run with node(1)
  * Remove a typo that was leaking a global.
  * Removed `Object.prototype` forEach() and map() methods
  * Removed a few utils not used
  * Removed `connect.createApp()`
  * Removed `res.simpleBody()`
  * Removed _format_ middleware
  * Removed _flash_ middleware
  * Removed _redirect_ middleware
  * Removed _jsonrpc_ middleware, use [visionmedia/connect-jsonrpc](http://github.com/visionmedia/connect-jsonrpc)
  * Removed _pubsub_ middleware
  * Removed need for `params.{captures,splat}` in _router_ middleware, `params` is an array
  * Changed; _compiler_ no longer 404s
  * Changed; _router_ signature now matches connect middleware signature
  * Fixed a require in _session_ for default `MemoryStore`
  * Fixed nasty request body bug in _router_. Closes #54
  * Fixed _less_ support in _compiler_
  * Fixed bug preventing proper bubbling of exceptions in mounted servers
  * Fixed bug in `Server#use()` preventing `Server` instances as the first arg
  * Fixed **ENOENT** special case, is now treated as any other exception
  * Fixed spark env support

0.2.1 / 2010-07-09
==================

  * Added support for _router_ `next()` to continue calling matched routes
  * Added mime type for _cache.manifest_ files.
  * Changed _compiler_ middleware to use async require
  * Changed session api, stores now only require `#get()`, and `#set()`
  * Fixed _cacheManifest_ by adding `utils.find()` back

0.2.0 / 2010-07-01
==================

  * Added calls to `Session()` casts the given object as a `Session` instance
  * Added passing of `next()` to _router_ callbacks. Closes #46
  * Changed; `MemoryStore#destroy()` removes `req.session`
  * Changed `res.redirect("back")` to default to "/" when Referr?er is not present
  * Fixed _staticProvider_ urlencoded paths issue. Closes #47
  * Fixed _staticProvider_ middleware responding to **GET** requests
  * Fixed _jsonrpc_ middleware `Accept` header check. Closes #43
  * Fixed _logger_ format option
  * Fixed typo in _compiler_ middleware preventing the _dest_ option from working

0.1.0 / 2010-06-25
==================

  * Revamped the api, view the [Connect documentation](http://extjs.github.com/Connect/index.html#Middleware-Authoring) for more info (hover on the right for menu)
  * Added [extended api docs](http://extjs.github.com/Connect/api.html)
  * Added docs for several more middleware layers
  * Added `connect.Server#use()`
  * Added _compiler_ middleware which provides arbitrary static compilation
  * Added `req.originalUrl`
  * Removed _blog_ example
  * Removed _sass_ middleware (use _compiler_)
  * Removed _less_ middleware (use _compiler_)
  * Renamed middleware to be camelcase, _body-decoder_ is now _bodyDecoder_ etc.
  * Fixed `req.url` mutation bug when matching `connect.Server#use()` routes
  * Fixed `mkdir -p` implementation used in _bin/connect_. Closes #39
  * Fixed bug in _bodyDecoder_ throwing exceptions on request empty bodies
  * `make install` installing lib to $LIB_PREFIX aka $HOME/.node_libraries

0.0.6 / 2010-06-22
==================

  * Added _static_ middleware usage example
  * Added support for regular expressions as paths for _router_
  * Added `util.merge()`
  * Increased performance of _static_ by ~ 200 rps
  * Renamed the _rest_ middleware to _router_
  * Changed _rest_ api to accept a callback function
  * Removed _router_ middleware
  * Removed _proto.js_, only `Object#forEach()` remains

0.0.5 / 2010-06-21
==================

  * Added Server#use() which contains the Layer normalization logic
  * Added documentation for several middleware
  * Added several new examples
  * Added _less_ middleware
  * Added _repl_ middleware
  * Added _vhost_ middleware
  * Added _flash_ middleware
  * Added _cookie_ middleware
  * Added _session_ middleware
  * Added `utils.htmlEscape()`
  * Added `utils.base64Decode()`
  * Added `utils.base64Encode()`
  * Added `utils.uid()`
  * Added bin/connect app path and --config path support for .js suffix, although optional. Closes #26
  * Moved mime code to `utils.mime`, ex `utils.mime.types`, and `utils.mime.type()`
  * Renamed req.redirect() to res.redirect(). Closes #29
  * Fixed _sass_ 404 on **ENOENT**
  * Fixed +new Date duplication. Closes #24

0.0.4 / 2010-06-16
==================

  * Added workerPidfile() to bin/connect
  * Added --workers support to bin/connect stop and status commands
  * Added _redirect_ middleware
  * Added better --config support to bin/connect. All flags can be utilized
  * Added auto-detection of _./config.js_
  * Added config example
  * Added `net.Server` support to bin/connect
  * Writing worker pids relative to `env.pidfile`
  * s/parseQuery/parse/g
  * Fixed npm support

0.0.3 / 2010-06-16
==================

  * Fixed node dependency in package.json, now _">= 0.1.98-0"_ to support __HEAD__

0.0.2 / 2010-06-15
==================

  * Added `-V, --version` to bin/connect
  * Added `utils.parseCookie()`
  * Added `utils.serializeCookie()`
  * Added `utils.toBoolean()`
  * Added _sass_ middleware
  * Added _cookie_ middleware
  * Added _format_ middleware
  * Added _lint_ middleware
  * Added _rest_ middleware
  * Added _./package.json_ (npm install connect)
  * Added `handleError()` support
  * Added `process.connectEnv`
  * Added custom log format support to _log_ middleware
  * Added arbitrary env variable support to bin/connect (ext: --logFormat ":method :url")
  * Added -w, --workers to bin/connect
  * Added bin/connect support for --user NAME and --group NAME
  * Fixed url re-writing support

0.0.1 / 2010-06-03
==================

  * Initial release
