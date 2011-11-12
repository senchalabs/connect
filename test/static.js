
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.static(fixtures));

describe('connect.static()', function(){
  it('should serve static files', function(done){
    app.request()
    .get('/todo.txt')
    .expect('- groceries', done);
  })
})