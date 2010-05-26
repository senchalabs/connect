// Shortcut for
var controlled = ["/console/", "/files/", "/messages/"];

require('./lib/stack')([
    // We want to log all http traffic
    ["", 'filters/log'],
    // Show pretty pages for exceptions
    ["", 'filters/error-handler'],
    // Add cookie based sessions to the controlled routes
    [controlled, 'filters/session'],
    // Make sure the user is authenticated
    [controlled, 'filters/authentication', {}],
    // Restrict access to controlled pages by user rules
    [controlled, 'filters/authorization', {}],
    // Listen for publish subscribe messages in real-time
    ["/messages/", 'providers/pubsub', {}],
    // This is a logic endpoint, it's ext-direct rpc protocol
    ["/console/", 'providers/direct', {}],
    // Cache all rest and static responses
    ["/", 'filters/cache'],
    // Gzip all resources when it makes sense
    ["/", 'filters/gzip'],
    // This is another logic endpoint, it's a rest-style interface to files
    ["/files/", 'providers/rest', {}],
    // Finally serve everything else as static files
    ["/", 'providers/static', __dirname + "/public"],
]);
