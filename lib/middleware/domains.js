/*!
 * Connect - domains
 * Copyright(c) 2013 John Henry
 * MIT Licensed
 */

/**
 * Domains:
 *
 * Parse req.headers.host into a heiarchy of domains 
 * and sub-domains populating the `req.domains` object.
 *
 * Examples:
 *      
 *     connect()
 *       .use(connect.domains("test.example.com"))
 *       .use(function(req, res){
 *         res.end(JSON.stringify(req.domains));
 *       });
 *
 * @param {Int} level 
 * // Number of levels beyound which are exclusively within the domain of the application
 * // Note: as the top level domain must contain at least one token, this will happen at least once, no matter what's specificed
 * @param {String} level 
 * // Alternatively, a string may be given as the domain of the application
 * // Note: This works by matching the number of tokens between dots ("."s). Anything between dots will be ignored.
 * // Example specifying level as "test.example.com" will work the same as "maps.google.com" or even "..."
 * // This makes it especially when wanting to match ip addresses as in "127.0.0.1"
 * @return {Function}
 * @api public
 */
module.exports = function domains(level){
  return function domains(req, res, next){
    if (!req.domains) {
      var level = ((typeof level === 'string')? level.split(".").length : 0) || level || 2;
      var subdomains = req.headers.host.split(".");
      var domain = [];
      do{
        domain.unshift(subdomains.pop());
        level--;
      }while(level>0)
      req.domains = [domain.join(".")].concat(subdomains.reverse());
    }
    next();
  };
};
