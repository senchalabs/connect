
var connect = require('../');

var app = connect()
  .use(connect.subdomains())
  .use(function(req, res){
    res.end(JSON.stringify(req.subdomains));
  });

describe('connect.subdomains()', function(){
  describe('req.subdomains', function(){
    describe('with no subdomains', function(){
      it('should be empty', function(done){
        app.request()
        .get('/')
        .set('Host', 'example.com')
        .expect('[]', done);
      })
    })

    describe('with several subdomains', function(){
      it('should be populated', function(done){
        app.request()
        .get('/')
        .set('Host', 'photos.tobi.example.com')
        .expect('["tobi","photos"]', done);
      })
    })
  })
})