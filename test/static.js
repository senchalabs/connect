
var connect = require('../')
  , request = require('./support/http');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.static(fixtures));

describe('connect.static()', function(){
  it('should serve static files', function(done){
    request(app)
    .get('/todo.txt')
    .end(function(res){
      res.body.should.equal('- groceries');
      done();
    });
  })
})