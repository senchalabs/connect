
/**
 * Module dependencies.
 */

var connect = require('connect'),
    childProcess = require('child_process'),
    helpers = require('./helpers'),
    assert = require('assert'),
    path = require('path'),
    binPath = path.join(__dirname, '..', 'bin', 'connect');

// Helper function

function exec(){
    var args = Array.prototype.slice.call(arguments),
        fn = args.pop();
    childProcess.execFile(binPath, args, fn);
}

module.exports = {
    'test --help': function(){
        function callback(err, stdout, stderr){
            assert.equal(1, err.code, 'Test --help exit status > 0');
            assert.equal(0, stdout.indexOf('Usage: connect'), 'Test --help stdout');
            assert.equal('', stderr, 'Test --help stderr');
        }
        exec('-h', callback);
        exec('--help', callback);
    }
}