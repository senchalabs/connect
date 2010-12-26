
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var net = require('net'),
    _repl = require('repl');

/**
 * Start a **REPL** on the given unix domain `socket` path.
 *
 * Options:
 *
 *    - `socket`     Unix domain socket path. Defaults to "/tmp/connect.sock"
 *    - `prompt`      **REPL** prompt string. Defaults to "node> "
 *
 * Example:
 *
 *     $ rlwrap telnet /tmp/connect.sock
 *
 * @param {String} prompt
 * @param {String} socket path
 * @return {Function}
 * @api public
 */

module.exports = function repl(prompt, socket){
    prompt = process.connectEnv.replPrompt || prompt || 'node> ';
    socket = process.connectEnv.replSocket || socket || '/tmp/connect.sock';
    net.createServer(function(stream){
        _repl.start(prompt, stream);
    }).listen(socket);
    return function repl(req, res, next){
        // Pass through for now
        next();
    }
};
