
var users = [
    { name: 'tj' },
    { name: 'tim' }
];

var userRoutes = {
    get: {
        '.:format?': function(req, res, params){
            var body = '<ul>' 
                + users.map(function(user){ return '<li>' + user.name + '</li>'; }).join('\n')
                + '</ul>';
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': body.length
            });
            res.end(body, 'utf8');
        },
        '/:id/:op?': function(req, res, params){
            var body = users[params.id]
                ? users[params.id].name
                : 'User ' + params.id + ' does not exist';
            if (params.op) {
                body = params.op + 'ing ' + body;
            }
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': body.length
            });
            res.end(body, 'utf8');
        }
    }
};

var mainRoutes = {
    get: {
        '/': function(req, res){
            var body = 'Visit <em>/users</em>, <em>/users/0</em>, or <em>/users.json</em>';
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': body.length
            });
            res.end(body, 'utf8');
        }
    }
};

module.exports = require('./../../lib/connect').createServer([
    { filter: 'log' },
    { provider: 'rest', routes: userRoutes, route: '/users' },
    { provider: 'rest', routes: mainRoutes },
]);