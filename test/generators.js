var connect = require('../');

function wait(done) {
  setImmediate(done);
}

describe('connect.use(gen)', function(){
  it('should work', function(done){
    var app = connect();

    app.use(function(req, res, next){
      setImmediate(next);
    })

    app.use(function *(req, res){
      yield wait;
      res.statusCode = 204;
      res.end();
    })

    app.request()
    .get('/')
    .expect(204, done);
  })

  it('should work with next()', function(done){
    var app = connect();

    app.use(function(req, res, next){
      setImmediate(next);
    })

    app.use(function *(req, res, next){
      yield wait;
      next();
    })

    app.use(function(req, res, next){
      setImmediate(next);
    })

    app.use(function *(req, res, next){
      yield wait;
      res.statusCode = 204;
      res.end();
    })

    app.request()
    .get('/')
    .expect(204, done);
  })

  it('should not work with yield next', function(){
    // Not sure how to test it.
  })

  it('should compose downstream', function(done){
    var app = connect();

    var arr = [];

    app.use(function(req, res, next){
      arr.push(1);
      setImmediate(next);
    })

    app.use(function *(req, res, next){
      yield wait;
      arr.push(2);
      next();
    })

    app.use(function(req, res, next){
      arr.push(3);
      setImmediate(next);
    })

    app.use(function *(req, res, next){
      yield wait;
      arr.push(4);
      res.statusCode = 204;
      res.end();
    })

    app.request()
    .get('/')
    .expect(204, done);
  })

  it('should not catch downstream errors', function(){
    // Not sure how to test it.
  })

  it('should work as an error handler', function(done){
    var app = connect();
    var err = new Error();

    app.use(function(req, res, next){
      next(err);
    })

    app.use(function *(err2, req, res, next){
      err.should.equal(err2);
      res.statusCode = 204;
      res.end();
    })

    app.request()
    .get('/')
    .expect(204, done);
  })

  it('should pass errors to the error handler', function(done){
    var app = connect();
    var err = new Error();

    app.use(function *(){
      throw err;
    })

    app.use(function *(err2, req, res, next){
      err.should.equal(err2);
      res.statusCode = 204;
      res.end();
    })

    app.request()
    .get('/')
    .expect(204, done);
  })
})