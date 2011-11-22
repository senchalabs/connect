
var connect = require('../')
  , request = require('./support/http');

var app = connect();

app.use(connect.query());

app.use(function(req, res){
  res.end(JSON.stringify(req.query));
});

describe('connect.query()', function(){
  it('should parse the query-string', function(done){
    request(app)
    .get('/?user[name]=tobi')
    .end(function(res){
      res.body.should.equal('{"user":{"name":"tobi"}}');
      done();
    });
  })
  
  it('should default to {}', function(done){
    request(app)
    .get('/')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    });
  })
})