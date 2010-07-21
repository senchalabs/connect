
var users = [
    { name: 'tj' },
    { name: 'tim' }
];

function user(app){
    app.get('/(all.:format?)?', function(req, res, params){
        var body;
        switch (params.format) {
            case 'json':
                body = JSON.stringify(users);
                break;
            default:
                 body = '<ul>'
                    + users.map(function(user){ return '<li>' + user.name + '</li>'; }).join('\n')
                    + '</ul>';
        }
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': body.length
        });
        res.end(body, 'utf8');
    });

    app.get('/:id/:op?', function(req, res, params){
        var body = users[params.id]
            ? users[params.id].name
            : 'User ' + params.id + ' does not exist';
        body = (params.op || 'view') + 'ing ' + body;
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': body.length
        });
        res.end(body, 'utf8');
    });
}

function main(app){
    app.get('/', function(req, res, params){
        var examples = [
            '/users (or /users/all)',
            '/users/all.json',
            '/users/0 (or /users/0/view)',
            '/users/0/edit'
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
    connect.logger()
);

server.use("/users/", connect.router(user));
server.use(connect.router(main));
server.listen(3000);
console.log('Connect server listening on port 3000');
