
var connect = require('../');

// visit form.html

connect.createServer()
  .use(connect.static(__dirname + '/public'))
  .use(connect.bodyParser())
  .use(function(req, res, next){
    if ('GET' != req.method) return next();
    res.statusCode = 302;
    res.setHeader('Location', 'form.html');
    res.end();
  })
  .use(function(req, res){
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>thanks ' + req.body.name + '</p>');
    res.write('<ul>');
    req.body.images.forEach(function(image){
      var kb = image.size / 1024 | 0;
      res.write('<li>uploaded ' + image.name + ' ' + kb + 'kb</li>');
    });
    res.end('</ul>');
  })
  .listen(3000);