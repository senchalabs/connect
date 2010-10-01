// NOTE:
// When testing this demo you need to ensure that the domain you're hosting
// it on is in the network section of the cache manifest (second argument)
// or the long-poll may not work.

var connect = require('../../lib/connect');
var root = __dirname + "/public";

var subscribers = [];

function setupRoutes(app) {
  var callbacks = [];
  app.get("/:client_id", function (req, res, next) {
    var localID = req.params.client_id;
    function handler(sender, buffer) {
      // Ignore responses to self
      if (sender == localID) {
        callbacks.push(handler);
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Content-Length": buffer.length
      });
      res.end(buffer);
    }
    callbacks.push(handler);
  });
  app.post("/:client_id", function (req, res, next) {
    var localID = req.params.client_id;
    var message = new Buffer(JSON.stringify(req.body));
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callbacks[i](localID, message);
    }
    callbacks.splice(0, l);
    res.writeHead(204, {});
    res.end();
  });
}

// Create a server with no initial setup
var server = connect.createServer();

// Add global filters
server.use("/",
    connect.logger({format: ':method :url :status HTTP:http-version :remote-addr'})
);

// Serve dynamic responses
server.use("/stream",
    connect.bodyDecoder(),
    connect.router(setupRoutes)
);

// Serve static resources
server.use("/",
    connect.cacheManifest(root, ["http://localhost:3000/", "http://192.168.1.160:3000/"]),
    connect.conditionalGet(),
    connect.cache(),
    connect.gzip(),
    connect.staticProvider(root)
);

server.listen(3000);
console.log('Connect server listening on port 3000');
