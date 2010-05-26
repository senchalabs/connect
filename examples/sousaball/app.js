// Shortcut for
require('./lib/stack')([
    ["", 'filters/log'],
    ["", 'filters/cache'],
    ["", 'filters/gzip'],
    // First serve static files
    ["/", 'providers/static', __dirname + "/public"],
    // Then the game logic as a router endpoint
    ["/", 'providers/router', require('./logic')],
]);
