
/**
 * Module dependencies.
 */

var connect = require('../');

var account = connect(function(req, res){
  var location = 'http://localhost:3000/account/' + req.subdomains[0];
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end('Moved to ' + location);
});

var blog = connect(function(req, res){
  res.end('blog app');
});

var main = connect(
  connect.router(function(app){
    app.get('/account/:user', function(req, res){
      res.end('viewing user account for ' + req.params.user);
    });

    app.get('/', function(req, res){
      res.end('main app');
    });
  })
);

connect(
    connect.logger()
  , connect.vhost('blog.localhost', blog)
  , connect.vhost('*.localhost', account)
  , main
).listen(3000);