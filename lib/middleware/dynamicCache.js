/*!
 * Connect - dynamicCache
 * Copyright(c) 2011 DeepinSource
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , utils = require('../utils')
  , Cache = require('../cache');
    
/**
 * Enables a memory cache layer on top of
 * the request that you specified.
 * 
 * Take a example, you have CRUD for users, 
 * by specifying { path: '/users', ttl: oneDay },
 * this middleware will cache all GET request that starts with /users,
 * and will delete related cache when you POST, PUT or DELETE
 *
 * By default a maximum of 128 objects are
 * held in cache, with a max of 256k each,
 * totalling ~32mb.
 *
 * A Least-Recently-Used (LRU) cache algo
 * is implemented through the `Cache` object,
 * simply rotating cache objects as they are
 * hit. This means that increasingly popular
 * objects maintain their positions while
 * others get shoved out of the stack and
 * garbage collected.
 *
 * Options:
 *
 *   - `maxObjects`  max cache objects [128]
 *   - `rules`  array of path you want to cache       
 *     - 'rules.path' url to cache
 *     - 'rules.ttl' time to live for cache
 * 
 * Examples in express:
 *
 *  app.use(express.dynamicCache({
 *    rules: [
 *      { path: '/users', ttl: oneDay }
 *    ]
 *    , maxObjects: 128
 *  }));
 */

module.exports = function dynamicCache(options) {
  var cache = new Cache(options.maxObjects || 128);
  var rules = options.rules;
  if (rules.length < 1) throw new Error('no rules');   

  return function dynamicCache(req, res, next) {
    // skip this middleware when no cache
    if(req.headers['x-no-cache'] == "1") return next();

    var isRequestMatched
      , matchedRule;
    
    rules.forEach(function(rule){
      if (!rule.path || rule.path.length <= 0)
        throw new Error('you must define the path to be cached.');

      if (req.url.indexOf(rule.path) == 0) {
        isRequestMatched = true;
        matchedRule = rule;
        return;
      }
    });

    if(isRequestMatched){      
      if(req.method == 'GET' || req.method == 'HEAD') {        
        var cacheGroup = cache.get(matchedRule.path)
          , cacheHit = cacheGroup ? cacheGroup[req.url] : null;
          
        if (cacheGroup && cacheHit) {
          // conditional GET support
          if (utils.conditionalGET(req)) {
            return utils.notModified(res);
          }                   
          // HEAD && GET support
          return responseCache(req, res, cacheHit);          
        }
        else {
          if (!('host' in req.headers)) 
            throw new Error('host in HTTP headers must be defined');
          
          var tmp = req.headers.host.split(':');
          var options = {
            host: tmp[0]
            , port: tmp.length > 1 ? tmp[1] : 80
            , path: req.url
            , headers: {'x-no-cache': '1'}
          };
          
          http.get(options, function(response) {
            var cacheGroup = cache.get(matchedRule.path);
            if(!cacheGroup) cacheGroup = cache.add(matchedRule.path);
            // cache headers
            var cacheItem = cacheGroup[req.url] = {};
            
            // headers fields 
            var now = new Date();
            cacheItem.headers = response.headers;
            cacheItem.headers.date = now.toUTCString();
            cacheItem.headers['Cache-Control'] = 'public, max-age=' + (matchedRule.ttl / 1000);
            cacheItem.headers['Last-Modified'] = now.toUTCString();
            cacheItem.headers['ETag'] = now.getTime();                        
            cacheItem.statusCode = response.statusCode;
            
            var body = '';
            response.on('data', function (chunk) {              
              body += chunk;                        
            });
            response.on('end', function () {              
              // cache body
              cacheItem.body = body;
              // clear cache if ttl is set
              if(matchedRule.ttl) {
                setTimeout(function(){
                  delete cacheGroup[req.url];
                }, matchedRule.ttl);
              }         
              responseCache(req, res, cacheItem);
            });            
          }).on('error', function(e) {
            console.log('Error in cache refreshing for ' + req.url + ': ');
            console.log(e.message);
          }); 
        }
      }
      else {
        //  change res.end behavior                
        var end = res.end;
        res.end = function(chunk, encoding){
          res.end = end;
          res.end(chunk, encoding);
          if(res.statusCode == 200) {
            // remove cache
            cache.remove(matchedRule.path);
          }
        };        
        next();
      }      
    } else {
      next();
    }
  }  
};

/**
 * send cache to response
 */
function responseCache(req, res, cache) {           
  for (var key in cache.headers) {
    res.setHeader(key, cache.headers[key]);
  }
  res.statusCode = cache.statusCode;
  // HEAD request support
  if(req.method == 'HEAD')
    return res.end();
  // GET request support
  return res.end(cache.body);
}

