
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
    'test -h, --help': function(){
        function callback(err, stdout, stderr){
            assert.equal(1, err.code, 'Test --help exit status > 0');
            assert.equal(0, stderr.indexOf('Usage: connect'), 'Test --help stderr');
            assert.equal('', stdout, 'Test --help stdout');
        }
        exec('-h', callback);
        exec('--help', callback);
    },
    
    'test -I, --include': function(){
        exec('--include', '.', function(err, stdout, stderr){
            assert.equal(undefined, err, 'Test --include exit status < 0 when path is present');
        })
        exec('--include', function(err, stdout, stderr){
            assert.equal(1, err.code, 'Test --include exit status > 0 when path is omitted');
            assert.equal('--include requires a path.\n', stderr, 'Test --include stderr when path is omitted');
        })
    }
}