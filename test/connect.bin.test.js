
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
            assert.equal(undefined, err, 'Test --include exit status of 0 when path is present');
        });
        exec('--include', function(err, stdout, stderr){
            assert.equal(1, err.code, 'Test --include exit status > 0 when path is omitted');
            assert.equal('--include requires an argument.\n', stderr, 'Test --include stderr when path is omitted');
        });
    },
    
    'test -e, --eval': function(){
        exec('--eval', 'require("sys").puts("wahoo")', function(err, stdout, stderr){
           assert.equal(undefined, err, 'Test --eval exit status of 0 when string is present'); 
           assert.equal('wahoo\n', stdout, 'Test --eval stdout with string present');
           assert.equal('', stderr, 'Test --eval stderr with string present');
        });
        exec('--eval', function(err, stdout, stderr){
           assert.equal(1, err.code, 'Test --eval exit status > 0 when string is omitted'); 
           assert.equal('--eval requires an argument.\n', stderr, 'Test --eval stderr when string is omitted');
        });
    },
    
    'test -p, --port': function(){
        exec('--port', 3000, function(err, stdout, stderr){
           assert.equal(undefined, err, 'Test --port exit status of 0 when port is present'); 
        });
        exec('--port', function(err, stdout, stderr){
           assert.equal(1, err.code, 'Test --port exit status > 0 when port is omitted'); 
           assert.equal('--port requires an argument.\n', stderr, 'Test --port stderr when port is omitted');
        });
    },
    
    'test -H, --host': function(){
        exec('--host', '0.0.0.0', function(err, stdout, stderr){
           assert.equal(undefined, err, 'Test --host exit status of 0 when string is present'); 
        });
        exec('--host', function(err, stdout, stderr){
           assert.equal(1, err.code, 'Test --host exit status > 0 when string is omitted'); 
           assert.equal('--host requires an argument.\n', stderr, 'Test --host stderr when string is omitted');
        });
    }
}