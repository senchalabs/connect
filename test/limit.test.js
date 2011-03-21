
/**
 * Module dependencies.
 */

var connect = require('connect')
  , should = require('should')
  , assert = require('assert')
  , http = require('http');

function create(size) {
  return connect(
      connect.limit(size)
    , function(req, res){
      req.len = 0;
      req.on('data', function(chunk){ req.len += chunk.length });
      req.on('end', function(){ res.end('ok'); });
    }
    , function(err, req, res, next){
      err.message.should.equal('limit of 5120 bytes exceeded');
      res.statusCode = 413;
      res.end('limit exceeded, cut off at ' + req.len);
    }
  );
}

module.exports = {
  'test limit exceeded': function(){
    var app = create(5 * 1024);

    app.listen(10000);

    var options = { method: 'POST', port: 10000 }
      , req = http.request(options, function(res){
        var body = '';
      res.statusCode.should.equal(413);
      res.on('data', function(chunk){ body += chunk });
      res.on('end', function(){
        body.should.equal('limit exceeded, cut off at 5120');
        app.close();
      });
    });

    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
  },
  
  'test limit string syntax': function(){
    var app = create('5kb');
  
    app.listen(10001);
  
    var options = { method: 'POST', port: 10001 }
      , req = http.request(options, function(res){
        var body = '';
      res.statusCode.should.equal(413);
      res.on('data', function(chunk){ body += chunk });
      res.on('end', function(){
        body.should.equal('limit exceeded, cut off at 5120');
        app.close();
      });
    });
  
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
  },
  
  'test limit': function(){
    var app = create(5 * 1024);
  
    app.listen(10002);
  
    var options = { method: 'POST', port: 10002 }
      , req = http.request(options, function(res){
      res.statusCode.should.equal(200);
      app.close();
    });
  
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.write(new Buffer(1024));
    req.end();
  }
};
