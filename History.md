
1.0.0 / 2010-07-21
==================

  * Added; mounted `Server` instances now have the `route` property exposed for reflection
  * Added support for callback as first arg to `Server#use()`
  * Added support for `next(true)` in _router_ to bypass match attempts
  * Added `Server#listen()` _host_ support
  * Added `Server#route` when `Server#use()` is called with a route on a `Server` instance
  * Added _methodOverride_ X-HTTP-Method-Override support
  * Refactored session internals, adds _secret_ option
  * Removed connect(1), it is now [spark(1)](http://github.com/senchalabs/spark)
  * Removed connect(1) dependency on examples, they can all now run with node(1)
  * Remove a typo that was leaking a global.
  * Removed a few utils not used
  * Removed _flash_ middleware
  * Removed _redirect_ middleware
  * Removed need for `params.{captures,splat}` in _router_ middleware, `params` is an array
  * Changed; _compiler_ no longer 404s
  * Changed; _router_ signature now matches connect middleware signature
  * Fixed a require in _session_ for default `MemoryStore`
  * Fixed nasty request body bug in _router_. Closes #54
  * Fixed _less_ support in _compiler_
  * Fixed bug preventing proper bubbling of exceptions in mounted servers
  * Fixed bug in `Server#use()` preventing `Server` instances as the first arg
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
