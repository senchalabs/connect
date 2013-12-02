
var connect = require('..');

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
          var arr = JSON.parse(res.body);
          arr.should.include('users');
          arr.should.include('file #1.txt');
          arr.should.include('nums');
          arr.should.include('todo.txt');
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
          res.should.be.html;
          res.body.should.include('<a href="/users"');
          res.body.should.include('<a href="/file%20%231.txt"');
          res.body.should.include('<a href="/todo.txt"');
          done();
        });
      });

      it('should sort folders first', function (done) {
        app.request()
        .get('/')
        .set('Accept', 'text/html')
        .end(function (res) {
          res.should.be.html;
          var urls = res.body.split(/<a href="([^"]*)"/).filter(function(s, i){ return i%2; });
          urls.should.eql([
            '/%23directory',
            '/users',
            '/file%20%231.txt',
            '/foo%20bar',
            '/nums',
            '/todo.txt',
          ]);
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
          res.body.should.include('users');
          res.body.should.include('file #1.txt');
          res.body.should.include('todo.txt');
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

  describe('when set with trailing slash', function () {
    var app = connect(connect.directory('test/fixtures/'));

    it('should respond with file list', function (done) {
      app.request()
      .get('/')
      .set('Accept', 'application/json')
      .end(function(res){
        res.statusCode.should.equal(200);
        var arr = JSON.parse(res.body);
        arr.should.include('users');
        arr.should.include('file #1.txt');
        arr.should.include('nums');
        arr.should.include('todo.txt');
        done();
      });
    });
  });

  describe('when set to \'.\'', function () {
    var app = connect(connect.directory('.'));

    it('should respond with file list', function (done) {
      app.request()
      .get('/')
      .set('Accept', 'application/json')
      .end(function(res){
        res.statusCode.should.equal(200);
        var arr = JSON.parse(res.body);
        arr.should.include('LICENSE');
        arr.should.include('lib');
        arr.should.include('test');
        done();
      });
    });

    it('should not allow serving outside root', function (done) {
      app.request()
      .get('/../')
      .set('Accept', 'text/html')
      .expect(403, done);
    });
  });
});
