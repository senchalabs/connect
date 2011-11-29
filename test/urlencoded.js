
var connect = require('../')
  , should = require('./shared');

var app = connect();

app.use(connect.urlencoded());

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.urlencoded()', function(){
  should['default request body'](app);
  
  it('should parse x-www-form-urlencoded', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('user=tobi')
    .end(function(res){
      res.body.should.equal('{"user":"tobi"}');
      done();
    });
  })
})