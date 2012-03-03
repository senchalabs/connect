module.exports = function timeout(options) {
  return function(req, res, next) {
    return next();
  };
}