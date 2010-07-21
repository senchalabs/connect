// NOTE:
// When testing this demo you need to ensure that the domain you're hosting
// it on is in the network section of the cache manifest (second argument)
// or the long-poll may not work.

var connect = require('../../lib/connect');
var root = __dirname + "/public";

var subscribers = [];

// This is esentially a broadcaster
var Backend = {
    subscribe: function (subscriber) {
        if (subscribers.indexOf(subscriber) < 0) {
            subscribers.push(subscriber);
            if (subscriber.timer) {
                clearTimeout(subscriber.timer);
            }
            subscriber.timer = setTimeout(function () {
                subscriber.flush();
            }, 1000);

        }
    },
    unsubscribe: function (subscriber) {
        var pos = subscribers.indexOf(subscriber);
        if (pos >= 0) {
            subscribers.slice(pos);
        }
    },
    publish: function (message, callback) {
        subscribers.forEach(function (subscriber) {
            subscriber.send(message);
        });
        callback();
    }
};

// Create a server with no initial setup
var server = connect.createServer();

// Add global filters
server.use("/",
    connect.responseTime(),
    connect.logger()
);

// Serve dynamic responses
server.use("/stream",
    connect.bodyDecoder(),
    connect.pubsub(Backend)
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
