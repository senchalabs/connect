
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
          arr.should.containEql('g# %3 o %2525 %37 dir');
          arr.should.containEql('users');
          arr.should.containEql('file #1.txt');
          arr.should.containEql('nums');
          arr.should.containEql('todo.txt');
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
          res.body.should.containEql('<a href="/g%23%20%253%20o%20%252525%20%2537%20dir"');
          res.body.should.containEql('<a href="/users"');
          res.body.should.containEql('<a href="/file%20%231.txt"');
          res.body.should.containEql('<a href="/todo.txt"');
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
            '/g%23%20%253%20o%20%252525%20%2537%20dir',
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
          res.body.should.containEql('users');
          res.body.should.containEql('g# %3 o %2525 %37 dir');
          res.body.should.containEql('file #1.txt');
          res.body.should.containEql('todo.txt');
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
        res.body.should.containEql('<a href="/users/index.html"');
        res.body.should.containEql('<a href="/users/tobi.txt"');
        done();
      });
    });

    it('should work for directory with #', function (done) {
      app.request()
      .get('/%23directory/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.body.should.containEql('<a href="/%23directory"');
        res.body.should.containEql('<a href="/%23directory/index.html"');
        done();
      });
    });

    it('should work for directory with special chars', function (done) {
      app.request()
      .get('/g%23%20%253%20o%20%252525%20%2537%20dir/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.body.should.containEql('<a href="/g%23%20%253%20o%20%252525%20%2537%20dir"');
        res.body.should.containEql('<a href="/g%23%20%253%20o%20%252525%20%2537%20dir/empty.txt"');
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

  describe('when setting a custom template', function () {
    var app = connect(connect.directory('test/fixtures', {'template': __dirname + '/shared/template.html'}));

    it('should respond with file list and testing template sentence', function (done) {
      app.request()
      .get('/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.should.be.html;
        res.body.should.containEql('<a href="/g%23%20%253%20o%20%252525%20%2537%20dir"');
        res.body.should.containEql('<a href="/users"');
        res.body.should.containEql('<a href="/file%20%231.txt"');
        res.body.should.containEql('<a href="/todo.txt"');
        res.body.should.containEql('This is the test template');
        done();
      });
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
        arr.should.containEql('users');
        arr.should.containEql('file #1.txt');
        arr.should.containEql('nums');
        arr.should.containEql('todo.txt');
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
        arr.should.containEql('LICENSE');
        arr.should.containEql('lib');
        arr.should.containEql('test');
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
