
var assert = require('assert')
var connect = require('..');
var request = require('supertest');

describe('app.listen()', function(){
  it('should wrap in an http.Server', function(done){
    var app = connect();

    app.use(function(req, res){
      res.end();
    });

    var server = app.listen(0, function () {
      assert.ok(server)
      request(server)
        .get('/')
        .expect(200, function (err) {
          server.close(function () {
            done(err)
          })
        })
    });
  });
});
