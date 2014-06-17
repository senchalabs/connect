var connect = require('../');

describe('connect.errorHandler()', function () {
  var app, request, error;

  before(function () {
    app = connect();
    app.use(function (req, res, next) {
      next(error);
    });
    app.use(connect.errorHandler());
  });

  beforeEach(function () {
    error = null;
  });

  describe('status code', function () {
    beforeEach(function () {
      request = app.request().get('/');
    });

    it('should set the status code to 500 if a non error status code was given', function (done) {
      error = {status: 200};
      request.end(function (res) {
        res.statusCode.should.be.exactly(500);
        done();
      });
    });

    it('should pass an error status code to the response object', function (done) {
      error = {status: 404};
      request.end(function (res) {
        res.statusCode.should.be.exactly(404);
        done();
      });
    });
  });

  describe('response content type', function () {
    beforeEach(function () {
        request = app.request();
        error = new Error();
    });

    it('should return a html response when html is accepted', function (done) {
      request.set('Accept', 'text/html')
        .get('/')
        .end(function (res) {
            res.headers['content-type'].should.startWith('text/html');
            res.body.should.containEql('<title>');
            done();
        });
    });

    it('should return a json response when json is accepted', function (done) {
      request.set('Accept', 'application/json')
        .get('/')
        .end(function (res) {
            var errorMessage = JSON.parse(res.body);

            res.headers['content-type'].should.startWith('application/json');
            errorMessage.should.be.an.instanceOf(Object);
            errorMessage.should.have.property('error');
            errorMessage.error.should.have.properties(['message', 'stack']);

            done();
        });
    });

    it('should return a plain text response when json or html is not accepted', function (done) {
      request
        .get('/')
        .set('Accept', 'bogus')
        .end(function (res) {
            res.headers['content-type'].should.startWith('text/plain');
            res.body.should.be.exactly(error.stack.toString());
            done();
        });
    });
  });

  describe('headers sent', function () {
    it('should not die', function (done) {
      var app = connect();
      app.use(function (req, res, next) {
        res.end('0');
        next(new Error('msg'));
      });
      app.use(connect.errorHandler());
      app.use(function (error, req, res, next) {
        process.nextTick(function () {
          throw error;
        });
      });

      app.request()
      .get('/')
      .expect(200, done);
    });
  });
});
