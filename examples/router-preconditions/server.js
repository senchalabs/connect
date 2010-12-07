
var connect = require('./../../lib/connect')
  , server = connect.createServer();

var users = [
    { name: 'tj', tags: ['foo', 'bar', 'bar'] }
  , { name: 'tobi', tags: ['ferret'] }
  , { name: 'jane', tags: ['ferret'] }
  , { name: 'loki', tags: ['ferret', 'fat'] }
];

server.use(connect.router(function(app){
  function asInt(n){ return parseInt(n, 10); }

  app.param('from', asInt);
  app.param('to', asInt);

  app.param('user', function(req, res, next, id){
    if (/^[0-9]+$/.test(id)) {
      if (req.user = users[id]) {
        next();
      } else {
        next(new Error('failed to find user ' + id));
      }
    } else {
      next(new Error('invalid user id'));
    }
  });

  app.get('/user/:user', function(req, res){
    res.writeHead(200);
    res.end('user ' + req.user.name);
  });

  app.get('/user/:user/tags/:from-:to', function(req, res){
    var from = req.params.from
      , to = req.params.to
      , tags = req.user.tags.slice(from, to);
    res.writeHead(200);
    res.end('user has tags ' + tags.join(', '));
  });
}));

server.listen(3000);
console.log('Connect server listening on port 3000');
