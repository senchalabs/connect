
var users = [
    { name: 'tj' },
    { name: 'tim' }
];

var userRoutes = {
    get: {
        '/.format?': function(req, res, params){
            var body = '<ul>' 
                + users.map(function(user){ return '<li>' + user.name + '</li>'; }).join('\n')
                + '</ul>';
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
    { provider: 'rest', routes: userRoutes, route: '/users' }
]);