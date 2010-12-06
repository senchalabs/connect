
var connect = require('./../../lib/connect')
  , server = connect.createServer();

var users = [
    { name: 'tj '}
  , { name: 'tobi' }
  , { name: 'jane' }
  , { name: 'loki' }
];

server.use(connect.router(function(app){
  app.param('userId', function(req, res, next, id){
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

  app.get('/user/:userId', function(req, res){
    res.writeHead(200);
    res.end('user ' + req.user.name);
  });
}));

server.listen(3000);
console.log('Connect server listening on port 3000');
