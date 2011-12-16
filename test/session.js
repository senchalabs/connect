
var connect = require('../');

function respond(req, res) {
  res.end(JSON.stringify(req.session));
}

var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(respond);

describe('connect.session()', function(){
  
})