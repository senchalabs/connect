
var users = [
    { name: 'tj' },
    { name: 'tim' }
];

function user(app){
    app.get('/.:format?', function(req, res, next){
        switch (req.params.format) {
            case 'json':
                var body = JSON.stringify(users);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Content-Length': body.length
                });
                res.end(body);
                break;
            default:
                 var body = '<ul>'
                    + users.map(function(user){ return '<li>' + user.name + '</li>'; }).join('\n')
                    + '</ul>';
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Content-Length': body.length
                });
                res.end(body);
                
        }
        
    });
    
    app.get('/:id.:format', function(req, res, next){
        var user = users[req.params.id];
        if (user && req.params.format === 'json') {
            user = JSON.stringify(user);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': user.length
            });
            res.end(user);
        } else {
            // When true is passed, provide control
            // back to middleware, skipping route
            // match attemps
            next(true); 
        }
    });

    app.get('/:id/:op?', function(req, res){
        var body = users[req.params.id]
            ? users[req.params.id].name
            : 'User ' + req.params.id + ' does not exist';
        body = (req.params.op || 'view') + 'ing ' + body;
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': body.length
        });
        res.end(body, 'utf8');
    });
}

function main(app){
    app.get('/', function(req, res){
        var examples = [
            '/users',
            '/users.json',
            '/users/0 (or /users/0/view)',
            '/users/0/edit'
            '/users/0.json'
        ];
        var body = 'Visit one of the following: <ul>'
            + examples.map(function(str){ return '<li>' + str + '</li>' }).join('\n')
            + '</ul>';
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': body.length
        });
        res.end(body, 'utf8');
    });
}

var connect = require('./../../lib/connect');

var server = connect.createServer(
    connect.logger({ buffer: true })
);

server.use("/users/", connect.router(user));
server.use(connect.router(main));
server.listen(3000);
console.log('Connect server listening on port 3000');
