
var connect = require('../')
  , http = require('http');

describe('connect.vhost()', function(){
  it('should route by Host', function(done){
    var app = connect()
      , tobi = connect()
      , loki = connect();

    app.use(connect.vhost('tobi.com', tobi));
    app.use(connect.vhost('loki.com', loki));

    tobi.use(function(req, res){ res.end('tobi') });
    loki.use(function(req, res){ res.end('loki') });

    app.request()
    .get('/')
    .set('Host', 'tobi.com')
    .expect('tobi', done);
  })

  it('should support http.Servers', function(done){
    var app = connect()
      , tobi = http.createServer(function(req, res){ res.end('tobi') })
      , loki = http.createServer(function(req, res){ res.end('loki') })

    app.use(connect.vhost('tobi.com', tobi));
    app.use(connect.vhost('loki.com', loki));

    app.request()
    .get('/')
    .set('Host', 'loki.com')
    .expect('loki', done);
  })

  it('should support wildcards', function(done){
    var app = connect()
      , tobi = http.createServer(function(req, res){ res.end('tobi') })
      , loki = http.createServer(function(req, res){ res.end('loki') })

    app.use(connect.vhost('*.ferrets.com', loki));
    app.use(connect.vhost('tobi.ferrets.com', tobi));

    app.request()
    .get('/')
    .set('Host', 'loki.ferrets.com')
    .expect('loki', done);
  })

  it('should 404 unless matched', function(done){
    var app = connect()
      , tobi = http.createServer(function(req, res){ res.end('tobi') })
      , loki = http.createServer(function(req, res){ res.end('loki') })

    app.use(connect.vhost('tobi.com', tobi));
    app.use(connect.vhost('loki.com', loki));

    app.request()
    .get('/')
    .set('Host', 'ferrets.com')
    .expect(404, done);
  })
})