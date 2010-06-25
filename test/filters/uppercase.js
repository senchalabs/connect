
module.exports = function(){
    return function(req, res, next){
        req.body = ''
        req.setEncoding('utf8')
        req.addListener('data', function(chunk){
            req.body += chunk
        })
        req.addListener('end', function(){
            req.body = req.body.toUpperCase()
            next(null, req, res)
        })
    };
};