

/**
 * Module dependencies.
 */

var connect = require('../')
  , os = require('os')

// $ curl -i http://localhost:3000/

connect(
    connect.profiler()
  , connect.logger()
  , connect.favicon()
  , connect.static(__dirname)
  , function(req, res, next){
    // simulate memory usage
    // for the example
    var free = os.freemem();
    os.freemem = function(){ return free + 5 * (1024 * 1024); };
    res.end('hello world');
  }
).listen(3000);