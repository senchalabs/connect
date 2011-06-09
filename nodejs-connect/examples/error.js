
/**
 * Module dependencies.
 */

var connect = require('../');

// try:
//   - viewing in a browser
//   - curl http://localhost:3000
//   - curl -H "Accept: application/json" http://localhost:3000

var server = connect.createServer(
  function(req, res, next){
    throw new Error('oh noes!');
  },
  connect.errorHandler({ stack: true, dump: true })
);

server.listen(3000);
console.log('Connect server listening on port 3000');