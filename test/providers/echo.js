
exports.handle = function(err, req, res, next){
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Conent-Length': req.body.length
    })
    res.end(req.body)
}