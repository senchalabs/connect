
/**
 * Module dependencies.
 */

var net = require('net'),
    sys = require('sys');

module.exports = net.createServer(function(stream){
    stream.addListener('data', function(chunk){
        stream.write(chunk);
    });
    stream.addListener('end', function(){
        stream.end();
    });
});