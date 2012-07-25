
2.4.2 / 2012-07-25 
==================

  * remove limit default from `urlencoded()`
  * remove limit default from `json()`
  * remove limit default from `multipart()`
  * fix `cookieSession()` clear cookie path / domain bug. Closes #636

2.4.1 / 2012-07-24 
==================

  * fix `options` mutation in `static()`

2.4.0 / 2012-07-23 
==================

  * add `connect.timeout()`
  * add __GET__ / __HEAD__ check to `directory()`. Closes #634
  * add "pause" util dep
  * update send dep for normalization bug

2.3.9 / 2012-07-16 
==================

  * add more descriptive invalid json error message
  * update send dep for root normalization regression
  * fix staticCache fresh dep

2.3.8 / 2012-07-12 
==================

  * fix `connect.static()` 404 regression, pass `next()`. Closes #629

2.3.7 / 2012-07-05 
==================

  * add `json()` utf-8 illustration test. Closes #621
  * add "send" dependency
  * change `connect.static()` internals to use "send"
  * fix `session()` req.session generation with pathname mismatch
  * fix `cookieSession()` req.session generation with pathname mismatch
  * fix mime export. Closes #618

2.3.6 / 2012-07-03 
==================

  * Fixed cookieSession() with cookieParser() secret regression. Closes #602
  * Fixed set-cookie header fields on cookie.path mismatch. Closes #615

2.3.5 / 2012-06-28 
==================

  * Remove `logger()` mount check
  * Fixed `staticCache()` dont cache responses with set-cookie. Closes #607
  * Fixed `staticCache()` when Cookie is present

2.3.4 / 2012-06-22 
==================

  * Added `err.buf` to urlencoded() and json()
  * Update cookie to 0.0.4. Closes #604
  * Fixed: only send 304 if original response in 2xx or 304 [timkuijsten]

2.3.3 / 2012-06-11 
==================

  * Added ETags back to `static()` [timkuijsten]
  * Replaced `utils.parseRange()` with `range-parser` module
  * Replaced `utils.parseBytes()` with `bytes` module
  * Replaced `utils.modified()` with `fresh` module
  * Fixed `cookieSession()` regression with invalid cookie signing [shtylman]

2.3.2 / 2012-06-08 
==================

  * expose mime module
  * Update crc dep (which bundled nodeunit)

2.3.1 / 2012-06-06 
==================

  * Added `secret` option to `cookieSession` middleware [shtylman]
  * Added `secret` option to `session` middleware [shtylman]
  * Added `req.remoteUser` back to `basicAuth()` as alias of `req.user`
  * Performance: improve signed cookie parsing
  * Update `cookie` dependency [shtylman]

2.3.0 / 2012-05-20 
==================

  * Added limit option to `json()`
  * Added limit option to `urlencoded()`
  * Added limit option to `multipart()`
  * Fixed: remove socket error event listener on callback
  * Fixed __ENOTDIR__ error on `static` middleware

2.2.2 / 2012-05-07 
==================

  * Added support to csrf middle for pre-flight CORS requests
  * Updated `engines` to allow newer version of node
  * Removed duplicate repo prop. Closes #560

2.2.1 / 2012-04-28 
==================

  * Fixed `static()` redirect when mounted. Closes #554

2.2.0 / 2012-04-25 
==================

  * Added `make benchmark`
  * Perf: memoize url parsing (~20% increase)
  * Fixed `connect(fn, fn2, ...)`. Closes #549

2.1.3 / 2012-04-20 
==================

  * Added optional json() `reviver` function to be passed to JSON.parse [jed]
  * Fixed: emit drain in compress middleware [nsabovic]

2.1.2 / 2012-04-11 
==================

  * Fixed cookieParser() `req.cookies` regression

2.1.1 / 2012-04-11 
==================

  * Fixed `session()` browser-session length cookies & examples
  * Fixed: make `query()` "self-aware" [jed]

2.1.0 / 2012-04-05 
==================

  * Added `debug()` calls to `.use()` (`DEBUG=connect:displatcher`)
  * Added `urlencoded()` support for GET
  * Added `json()` support for GET. Closes #497
  * Added `strict` option to `json()`
  * Changed: `session()` only set-cookie when modified
  * Removed `Session#lastAccess` property. Closes #399

2.0.3 / 2012-03-20 
==================

  * Added: `cookieSession()` only sets cookie on change. Closes #442
  * Added `connect:dispatcher` debug() probes

2.0.2 / 2012-03-04 
==================

  * Added test for __ENAMETOOLONG__ now that node is fixed
  * Fixed static() index "/" check on windows. Closes #498
  * Fixed Content-Range behaviour to match RFC2616 [matthiasdg / visionmedia]

2.0.1 / 2012-02-29 
==================

  * Added test coverage for `vhost()` middleware
  * Changed `cookieParser()` signed cookie support to use SHA-2 [senotrusov]
  * Fixed `static()` Range: respond with 416 when unsatisfiable
  * Fixed `vhost()` middleware. Closes #494

2.0.0 / 2011-10-05 
==================

  * Added `cookieSession()` middleware for cookie-only sessions
  * Added `compress()` middleware for gzip / deflate support
  * Added `session()` "proxy" setting to trust `X-Forwarded-Proto`
  * Added `json()` middleware to parse "application/json"
  * Added `urlencoded()` middleware to parse "application/x-www-form-urlencoded"
  * Added `multipart()` middleware to parse "multipart/form-data"
  * Added `cookieParser(secret)` support so anything using this middleware may access signed cookies
  * Added signed cookie support to `cookieParser()`
  * Added support for JSON-serialized cookies to `cookieParser()`
  * Added `err.status` support in Connect's default end-point
  * Added X-Cache MISS / HIT to `staticCache()`
  * Added public `res.headerSent` checking nodes `res._headerSent` until node does
  * Changed `basicAuth()` req.remoteUser to req.user
  * Changed: default `session()` to a browser-session cookie. Closes #475
  * Changed: no longer lowercase cookie names
  * Changed `bodyParser()` to use `json()`, `urlencoded()`, and `multipart()`
  * Changed: `errorHandler()` is now a development-only middleware
  * Changed middleware to `next()` errors when possible so applications can unify logging / handling
  * Removed `http[s].Server` inheritance, now just a function, making it easy to have an app providing both http and https
  * Removed `.createServer()` (use `connect()`)
  * Removed `secret` option from `session()`, use `cookieParser(secret)`
  * Removed `connect.session.ignore` array support
  * Removed `router()` middleware. Closes #262
  * Fixed: set-cookie only once for browser-session cookies
  * Fixed FQDN support. dont add leading "/"
  * Fixed 404 XSS attack vector. Closes #473
  * Fixed __HEAD__ support for 404s and 500s generated by Connect's end-point

1.8.5 / 2011-12-22 
==================

  * Fixed: actually allow empty body for json 

1.8.4 / 2011-12-22 
==================

  * Changed: allow empty body for json/urlencoded requests. Backport for #443

1.8.3 / 2011-12-16 
==================

  * Fixed `static()` _index.html_ support on windows

1.8.2 / 2011-12-03 
==================

  * Fixed potential security issue, store files in req.files. Closes #431 [reported by dobesv]

1.8.1 / 2011-11-21 
==================

  * Added nesting support for _multipart/form-data_ [jackyz]

1.8.0 / 2011-11-17 
==================

  * Added _multipart/form-data_ support to `bodyParser()` using formidable

1.7.3 / 2011-11-11 
==================

  * Fixed `req.body`, always default to {}
  * Fixed HEAD support for 404s and 500s

1.7.2 / 2011-10-24 
==================

  * "node": ">= 0.4.1 < 0.7.0"
  * Added `static()` redirect option. Closes #398
  * Changed `limit()`: respond with 413 when content-length exceeds the limit
  * Removed socket error listener in static(). Closes #389
  * Fixed `staticCache()` Age header field
  * Fixed race condition causing errors reported in #329.

1.7.1 / 2011-09-12 
==================

  * Added: make `Store` inherit from `EventEmitter`
  * Added session `Store#load(sess, fn)` to fetch a `Session` instance
  * Added backpressure support to `staticCache()`
  * Changed `res.socket.destroy()` to `req.socket.destroy()`

1.7.0 / 2011-08-31 
==================

  * Added `staticCache()` middleware, a memory cache for `static()`
  * Added public `res.headerSent` checking nodes `res._headerSent` (remove when node adds this)
  * Changed: ignore error handling middleware when header is sent
  * Changed: dispatcher errors after header is sent destroy the sock

1.6.4 / 2011-08-26 
==================

  * Revert "Added double-next reporting"

1.6.3 / 2011-08-26 
==================

  * Added double-`next()` reporting
  * Added `immediate` option to `logger()`. Closes #321
  * Dependency `qs >= 0.3.1`

1.6.2 / 2011-08-11 
==================

  * Fixed `connect.static()` null byte vulnerability
  * Fixed `connect.directory()` null byte vulnerability
  * Changed: 301 redirect in `static()` to postfix "/" on directory. Closes #289

1.6.1 / 2011-08-03 
==================

  * Added: allow retval `== null` from logger callback to ignore line
  * Added `getOnly` option to `connect.static.send()`
  * Added response "header" event allowing augmentation
  * Added `X-CSRF-Token` header field check
  * Changed dep `qs >= 0.3.0`
  * Changed: persist csrf token. Closes #322
  * Changed: sort directory middleware files alphabetically

1.6.0 / 2011-07-10 
==================

  * Added :response-time to "dev" logger format
  * Added simple `csrf()` middleware. Closes #315
  * Fixed `res._headers` logger regression. Closes #318
  * Removed support for multiple middleware being passed to `.use()`

1.5.2 / 2011-07-06 
==================

  * Added `filter` function option to `directory()` [David Rio Deiros] 
  * Changed: re-write of the `logger()` middleware, with extensible tokens and formats
  * Changed: `static.send()` ".." in path without root considered malicious
  * Fixed quotes in docs. Closes #312
  * Fixed urls when mounting `directory()`, use `originalUrl` [Daniel Dickison]


1.5.1 / 2011-06-20 
==================

  * Added malicious path check to `directory()` middleware
  * Added `utils.forbidden(res)`
  * Added `connect.query()` middleware

1.5.0 / 2011-06-20 
==================

  * Added `connect.directory()` middleware for serving directory listings

1.4.6 / 2011-06-18 
==================

  * Fixed `connect.static()` root with `..`
  * Fixed `connect.static()` __EBADF__

1.4.5 / 2011-06-17 
==================

  * Fixed EBADF in `connect.static()`. Closes #297

1.4.4 / 2011-06-16 
==================

  * Changed `connect.static()` to check resolved dirname. Closes #294

1.4.3 / 2011-06-06 
==================

  * Fixed fd leak in `connect.static()` when the socket is closed
  * Fixed; `bodyParser()` ignoring __GET/HEAD__. Closes #285

1.4.2 / 2011-05-27 
==================

  * Changed to `devDependencies`
  * Fixed stream creation on `static()` __HEAD__ request. [Andreas Lind Petersen]
  * Fixed Win32 support for `static()`
  * Fixed monkey-patch issue. Closes #261

1.4.1 / 2011-05-08 
==================

  * Added "hidden" option to `static()`. ignores hidden files by default. Closes   * Added; expose `connect.static.mime.define()`. Closes #251
  * Fixed `errorHandler` middleware for missing stack traces. [aseemk]
#274

1.4.0 / 2011-04-25 
==================

  * Added route-middleware `next('route')` support to jump passed the route itself
  * Added Content-Length support to `limit()`
  * Added route-specific middleware support (used to be in express)
  * Changed; refactored duplicate session logic
  * Changed; prevent redefining `store.generate` per request
  * Fixed; `static()` does not set Content-Type when explicitly set [nateps]
  * Fixed escape `errorHandler()` {error} contents
  * NOTE: `router` will be removed in 2.0


1.3.0 / 2011-04-06 
==================

  * Added `router.remove(path[, method])` to remove a route

1.2.3 / 2011-04-05 
==================

  * Fixed basicAuth realm issue when passing strings. Closes #253

1.2.2 / 2011-04-05 
==================

  * Added `basicAuth(username, password)` support
  * Added `errorHandler.title` defaulting to "Connect"
  * Changed `errorHandler` css

1.2.1 / 2011-03-30 
==================

  * Fixed `logger()` https `remoteAddress` logging [Alexander Simmerl]

1.2.0 / 2011-03-30 
==================

  * Added `router.lookup(path[, method])`
  * Added `router.match(url[, method])`
  * Added basicAuth async support. Closes #223

1.1.5 / 2011-03-27 
==================

  * Added; allow `logger()` callback function to return an empty string to ignore logging
  * Fixed; utilizing `mime.charsets.lookup()` for `static()`. Closes 245

1.1.4 / 2011-03-23 
==================

  * Added `logger()` support for format function
  * Fixed `logger()` to support mess of writeHead()/progressive api for node 0.4.x

1.1.3 / 2011-03-21 
==================

  * Changed; `limit()` now calls `req.destroy()`

1.1.2 / 2011-03-21 
==================

  * Added request "limit" event to `limit()` middleware
  * Changed; `limit()` middleware will `next(err)` on failure

1.1.1 / 2011-03-18 
==================

  * Fixed session middleware for HTTPS. Closes #241 [reported by mt502]

1.1.0 / 2011-03-17 
==================

  * Added `Session#reload(fn)`

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

