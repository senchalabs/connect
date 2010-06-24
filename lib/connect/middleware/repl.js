
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var net = require('net'),
    repl = require('repl');

/**
 * Start REPL on the given unix domain socket.
 *
 * Options:
 *
 *    - env.replSocket, sockect     Unix domain socket path. Defaults to "/tmp/connect.sock"
 *    - env.replPrompt, prompt      REPL prompt string. Defaults to "node> "
 *
 * Example: $ rlwrap telnet /tmp/connect.sock
 */
module.exports = function setup(prompt, socket) {
    prompt = prompt || 'node> ';
    socket = socket || '/tmp/connect.sock';
    net.createServer(function (stream) {
        repl.start(prompt, stream);
    }).listen(socket);
    
    // Dummy passthrough for now
    return function (req, res, next) {
        next();
    }
};
