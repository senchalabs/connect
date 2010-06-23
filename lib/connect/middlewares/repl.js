
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

exports.setup = function(env){
    var self = this;
    this.prompt = env.replPrompt || this.prompt || 'node> ';
    this.socket = env.replSocket || this.socket || '/tmp/connect.sock';
    net.createServer(function(stream){
        repl.start(self.prompt, stream);
    }).listen(this.socket);
};
