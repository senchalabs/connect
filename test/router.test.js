
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

/**
 * Path to ./test/fixtures/
 */

var fixturesPath = __dirname + '/fixtures';

module.exports = {
    'test routing': function(){
        var server = helpers.run([
            { provider: 'router', app: function(app){
                app.get('/(all.:format?)?', function(req, res, params){
                    res.writeHead(200, {});
                    res.end('products' + (params.format ? ' as ' + params.format : ''));
                });
                app.get('/:id', function(req, res, params){
                    res.writeHead(200, {});
                    res.end('product ' + params.id);
                });
            }, route: '/products' },
            { provider: 'router', app: function(app){
                app.post('/', function(req, res){
                    res.writeHead(200, {});
                    res.end('POST /');
                });
                app.put('/', function(req, res){
                    res.writeHead(200, {});
                    res.end('PUT /');
                });
                app.del('/', function(req, res){
                    res.writeHead(200, {});
                    res.end('DELETE /');
                });
                app.get('/', function(req, res){
                    res.writeHead(200, {});
                    res.end('GET /');
                });
                app.get('/public/*', function(req, res, params){
                    res.writeHead(200, {});
                    res.end('splat "' + params.splat[0] + '"');
                });
                app.get('/files/*.*', function(req, res, params){
                    res.writeHead(200, {});
                    res.end('path: "' + params.splat[0] + '" ext: "' + params.splat[1] + '"');
                });
                app.get('/user/:id/:operation?', function(req, res, params){
                    res.writeHead(200, {});
                    res.end((params.operation || 'view') + 'ing user ' + req.params.path.id);
                });
                app.get('/range/:from-:to?', function(req, res, params){
                    res.writeHead(200, {});
                    res.end('range ' + params.from + ' to ' + (params.to || 'HEAD'));
                });
                app.get('/users.:format', function(req, res, params){
                    res.writeHead(200, {});
                    res.end(params.format + ' format');
                });
                app.get(/\/commit\/(\w+)\.\.(\w+)\/?/i, function(req, res, params){
                    res.writeHead(200, {});
                    res.end('captures: ' + params.splat.join(', '));
                });
                app.get('/cookies.:format?', function(req, res, params){
                    var cookies = ['num', 'num'];
                    res.writeHead(200, {});
                    switch (params.format) {
                        case 'json':
                            res.end(JSON.stringify(cookies));
                            break;
                        default:
                            res.end(cookies.join(' '));
                    }
                });
            }}
        ]);
        
        server.assertResponse('GET', '/products', 200, 'products');
        server.assertResponse('GET', '/products/', 200, 'products');
        server.assertResponse('GET', '/products/all', 200, 'products');
        server.assertResponse('GET', '/products/all/', 200, 'products');
        server.assertResponse('GET', '/products/all.json', 200, 'products as json');
        server.assertResponse('GET', '/products/12', 200, 'product 12');
        
        server.assertResponse('GET', '/', 200, 'GET /', 'Test router GET /');
        server.assertResponse('POST', '/', 200, 'POST /', 'Test router POST /');
        server.assertResponse('PUT', '/', 200, 'PUT /', 'Test router PUT /');
        server.assertResponse('DELETE', '/', 200, 'DELETE /', 'Test router DELETE /');
        server.assertResponse('GET', '/user', 404, 'Cannot find /user', 'Test router GET unmatched path param');
        server.assertResponse('GET', '/user/12', 200, 'viewing user 12', 'Test router GET matched path param');
        server.assertResponse('GET', '/user/12/', 200, 'viewing user 12', 'Test router GET matched path param with trailing slash');
        server.assertResponse('GET', '/user/99/edit', 200, 'editing user 99', 'Test router GET matched path with several params');
        server.assertResponse('GET', '/user/99/edit/', 200, 'editing user 99', 'Test router GET matched path with several params with trailing slash');
        server.assertResponse('GET', '/range/11-99', 200, 'range 11 to 99');
        server.assertResponse('GET', '/range/11-', 200, 'range 11 to HEAD');
        server.assertResponse('GET', '/users.json', 200, 'json format');
        server.assertResponse('GET', '/cookies', 200, 'num num', 'Test router optional placeholder without value');
        server.assertResponse('GET', '/cookies.json', 200, '["num","num"]', 'Test reset optional placeholder with value');
        server.assertResponse('GET', '/public', 404, 'Cannot find /public', 'Test required splat without value');
        server.assertResponse('GET', '/public/jquery.js', 200, 'splat "jquery.js"', 'Test required splat with value');
        server.assertResponse('GET', '/public/javascripts/jquery.js', 200, 'splat "javascripts/jquery.js"', 'Test required splat with segmented');
        server.assertResponse('GET', '/files/jquery.js', 200, 'path: "jquery" ext: "js"', 'Test several required splats');
        server.assertResponse('GET', '/files/javascripts/jquery.js', 200, 'path: "javascripts/jquery" ext: "js"', 'Test several required splats');
        server.assertResponse('GET', '/commit/foo..bar', 200, 'captures: foo, bar', 'Test RegExp paths');
    }
}