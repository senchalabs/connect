
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