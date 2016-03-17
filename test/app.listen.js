
var connect = require('..');
var request = require('supertest');

describe('app.listen()', () => {
  it('should wrap in an http.Server', done => {
    var app = new connect();

    app.use((req, res) => {
      res.end();
    });

    app.listen(0, () => {
      request(app.wrapper())
      .get('/')
      .expect(200, done);
    });
  });
});
