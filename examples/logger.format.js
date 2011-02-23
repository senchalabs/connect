
/**
 * Module dependencies.
 */

var connect = require('../');

// $ curl -i http://localhost:3000/favicon.ico

// custom format with ansi-escape sequence colors
// format: <method> <url> <status> <response-time>ms


connect.createServer(
    connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems\033[0m')
  , connect.favicon()
).listen(3000);