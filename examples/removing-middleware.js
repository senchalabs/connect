
var connect  = require('./')
  , http = require('http');

// set up connect, add a few middlweware
var app = connect();
  app.use(connect.logger('dev'))
  app.use(connect.bodyParser())
  app.use(connect.static(__dirname + '/public', { maxAge: 0 }))
  app.use(connect.cookieParser())
  app.use(connect.cookieSession({ secret: 'some secret' }));

http.createServer(app).listen(3000);


// remove static after a few seconds
setTimeout(function() {

  console.log('no more static');

  app.unuse(connect.static(__dirname+'/public'), { maxAge: 0}); 

}, 3000);
