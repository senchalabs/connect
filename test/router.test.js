
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

// Faux products app

function products(app){
    app.get('/.:format?', function(req, res){
        res.writeHead(200, {});
        res.end('products' + (req.params.format ? ' as ' + req.params.format : ''));
    });
    app.get('/:id', function(req, res){
        res.writeHead(200, {});
        res.end('product ' + req.params.id);
    });
}

// Faux main app

function main(app){
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
    app.get('/public/*', function(req, res){
        res.writeHead(200, {});
        res.end('splat "' + req.params[0] + '"');
    });
    app.get('/files/*.*', function(req, res){
        res.writeHead(200, {});
        res.end('path: "' + req.params[0] + '" ext: "' + req.params[1] + '"');
    });
    app.get('/user/:id/:operation?', function(req, res){
        res.writeHead(200, {});
        res.end((req.params.operation || 'view') + 'ing user ' + req.params.id);
    });
    app.get('/range/:from-:to?', function(req, res){
        res.writeHead(200, {});
        res.end('range ' + req.params.from + ' to ' + (req.params.to || 'HEAD'));
    });
    app.get('/users.:format', function(req, res){
        res.writeHead(200, {});
        res.end(req.params.format + ' format');
    });
    app.get(/\/commit\/(\w+)\.\.(\w+)\/?/i, function(req, res){
        res.writeHead(200, {});
        res.end('captures: ' + [req.params[0], req.params[1]].join(', '));
    });
    app.get('/next', function(req, res, next){
        next();
    });
    app.get('/error', function(req, res, params, next){
        throw new Error('boom!');
    });
    app.get('/cookies.:format?', function(req, res, next){
        var cookies = ['num', 'num'];
        res.writeHead(200, {});
        switch (req.params.format) {
            case 'json':
                res.end(JSON.stringify(cookies));
                break;
            default:
                res.end(cookies.join(' '));
        }
    });
    app.get('/items/:id?', function(req, res, next){
        if (req.params.id) {
            res.writeHead(200, {});
            res.end('item ' + req.params.id);
        } else {
            next();
        }
    });
    app.get('/items', function(req, res, next){
        next()
    });
    app.get('/items', function(req, res){
        res.writeHead(200, {});
        res.end('items');
    });
    app.get('/failure/:id?', function(req, res, next){
        next(new Error('fail boat'));
    });
    app.get('/failure', function(req, res){
        assert.fail('next(new Error) passed to next matching router callback');
    });
    app.get('/out/:id?', function(req, res, next){
        next(true);
    });
    app.get('/out', function(){
        assert.fail('Called /out');
    });
}

module.exports = {
    'test routing': function(){
        var server = helpers.run();
        server.use('/products', connect.router(products));
        server.use('/', connect.router(main));
        server.use('/', connect.errorHandler({ showMessage: true }));

        server.assertResponse('GET', '/out', 404, 'Cannot GET /out');

        server.assertResponse('GET', '/items/12', 200, 'item 12');
        server.assertResponse('GET', '/items', 200, 'items');
        
        server.assertResponse('GET', '/failure/12', 500, 'Error: fail boat');
        
        server.assertResponse('GET', '/products', 200, 'products');
        server.assertResponse('GET', '/products/', 200, 'products');
        server.assertResponse('GET', '/products.json', 200, 'products as json');
        server.assertResponse('GET', '/products/12', 200, 'product 12');
        
        server.assertResponse('GET', '/next', 404, 'Cannot GET /next');
        server.assertResponse('GET', '/error', 500, 'Error: boom!');

        server.assertResponse('GET', '/', 200, 'GET /', 'Test router GET /');
        server.assertResponse('POST', '/', 200, 'POST /', 'Test router POST /');
        server.assertResponse('PUT', '/', 200, 'PUT /', 'Test router PUT /');
        server.assertResponse('DELETE', '/', 200, 'DELETE /', 'Test router DELETE /');
        server.assertResponse('GET', '/user', 404, 'Cannot GET /user', 'Test router GET unmatched path param');
        server.assertResponse('GET', '/user/12', 200, 'viewing user 12', 'Test router GET matched path param');
        server.assertResponse('GET', '/user/12/', 200, 'viewing user 12', 'Test router GET matched path param with trailing slash');
        server.assertResponse('GET', '/user/99/edit', 200, 'editing user 99', 'Test router GET matched path with several params');
        server.assertResponse('GET', '/user/99/edit/', 200, 'editing user 99', 'Test router GET matched path with several params with trailing slash');
        server.assertResponse('GET', '/range/11-99', 200, 'range 11 to 99');
        server.assertResponse('GET', '/range/11-', 200, 'range 11 to HEAD');
        server.assertResponse('GET', '/users.json', 200, 'json format');
        server.assertResponse('GET', '/cookies', 200, 'num num', 'Test router optional placeholder without value');
        server.assertResponse('GET', '/cookies.json', 200, '["num","num"]', 'Test reset optional placeholder with value');
        server.assertResponse('GET', '/public', 404, 'Cannot GET /public', 'Test required splat without value');
        server.assertResponse('GET', '/public/jquery.js', 200, 'splat "jquery.js"', 'Test required splat with value');
        server.assertResponse('GET', '/public/javascripts/jquery.js', 200, 'splat "javascripts/jquery.js"', 'Test required splat with segmented');
        server.assertResponse('GET', '/files/jquery.js', 200, 'path: "jquery" ext: "js"', 'Test several required splats');
        server.assertResponse('GET', '/files/javascripts/jquery.js', 200, 'path: "javascripts/jquery" ext: "js"', 'Test several required splats');
        server.assertResponse('GET', '/commit/foo..bar', 200, 'captures: foo, bar', 'Test RegExp paths');
    }
}