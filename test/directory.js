
var connect = require('..');
var utils = connect.utils;

var app = connect();
app.use(connect.directory('test/fixtures'));

describe('directory()', function(){
  describe('when given Accept: header', function () {
    describe('of application/json', function () {
      it('should respond with json', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'application/json')
        .end(function(res){
          utils.mime(res).should.equal('application/json');
          var arr = JSON.parse(res.body);
          arr.should.include('users');
          arr.should.include('file #1.txt');
          arr.should.include('nums');
          arr.should.include('todo.txt');
          done();
        });
      });
    });

    describe('of text/html', function () {
      it('should respond with html', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'text/html')
        .end(function (res) {
          utils.mime(res).should.equal('text/html');
          res.body.should.include('<a href="/users"');
          res.body.should.include('<a href="/file%20%231.txt"');
          res.body.should.include('<a href="/todo.txt"');
          done();
        });
      });
    });

    describe('of text/plain', function () {
      it('should respond with text', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'text/plain')
        .end(function (res) {
          utils.mime(res).should.equal('text/plain');
          res.body.should.include('users');
          res.body.should.include('file #1.txt');
          res.body.should.include('todo.txt');
          done();
        });
      });
    });

    describe('of application/json, */*; q=0.01', function () {
      it('should negotiate to json', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'application/json, */*; q=0.01')
        .end(function(res){
          utils.mime(res).should.equal('application/json');
          var arr = JSON.parse(res.body);
          arr.should.include('users');
          arr.should.include('file #1.txt');
          arr.should.include('nums');
          arr.should.include('todo.txt');
          done();
        });
      });
    });
  });

  describe('when navigating to other directory', function () {
    it('should respond with correct listing', function (done) {
      app.request()
      .get('/users/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.body.should.include('<a href="/users/index.html"');
        res.body.should.include('<a href="/users/tobi.txt"');
        done();
      });
    });

    it('should work for directory with #', function (done) {
      app.request()
      .get('/%23directory/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.body.should.include('<a href="/%23directory"');
        res.body.should.include('<a href="/%23directory/index.html"');
        done();
      });
    });

    it('should not work for outside root', function (done) {
      app.request()
      .get('/../support/')
      .set('Accept', 'text/html')
      .expect(403, done);
    });
  });
})