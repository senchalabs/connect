var Connect = require('./lib/connect');

var controlled = ["/console/", "/files/", "/messages/"];

new Connect.Server([
    // We want to log all http traffic
    {filter: "log"},
    // Add cookie based sessions to the controlled routes
    {filter: "session", route: controlled},
    // Make sure the user is authenticated
    {filter: "authentication", route: controlled, param: {}},
    // Restrict access to controlled pages by user rules
    {filter: "authorization", route: controlled, param: {}},
    // Listen for publish subscribe messages in real-time
    {provider: "pubsub", route: "/messages/", param: {}},
    // This is a logic endpoint, it's ext-direct rpc protocol
    {provider: "direct", route: "/console/", param: {}},
    // Use conditional GET to save on bandwidth
    {filter: "conditional-get"},
    // Cache all rest and static responses
    {filter: "cache"},
    // Gzip all resources when it makes sense
    {filter: "gzip"},
    // This is another logic endpoint, it's a rest-style interface to files
    // {provider: "rest", route: "/files/", param: {}},
    // Finally serve everything else as static files
    {provider: "static", param: __dirname + "/public"},
    // Show pretty pages for exceptions
    {filter: "error-handler"}
]).listen();