
var connect = require('..');

var app = connect();
app.use(connect.directory('lib'));

describe('directory()', function(){
  describe('when given Accept: header', function () {
    describe('of application/json', function () {
      it('should respond with json', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'application/json')
        .end(function(res){
          var arr = JSON.parse(res.body);
          arr.should.include('middleware');
          arr.should.include('public');
          arr.should.include('index.js');
          done();
        });
      });
    });

    describe('when Accept: text/html is given', function () {
      it('should respond with html', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'text/html')
        .end(function (res) {
          res.body.should.include('<a href="/middleware"');
          res.body.should.include('<a href="/index.js"');
          done();
        });
      });
    });

    describe('when Accept: text/plain is given', function () {
      it('should respond with text', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'text/plain')
        .end(function (res) {
          res.body.should.include('middleware');
          res.body.should.include('public');
          done();
        });
      });
    });
  });

  describe('when navigating to other directory', function () {
    it('should respond with correct listing', function (done) {
      app.request()
      .get('/middleware/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.body.should.include('<a href="/middleware/session"');
        res.body.should.include('<a href="/middleware/directory.js"');
        done();
      });
    });

    it('should not work for outside root', function (done) {
      app.request()
      .get('/../test/')
      .set('Accept', 'text/html')
      .expect(403, done);
    });
  });
})