
module.exports = {
    env: 'production',
    port: 4321,
    host: '127.0.0.1',
    verbose: true,
    'no-color': true,
    eval: ['require("sys").puts("anything you want!")',
           'require("sys").puts("or use an array for several flags")']
}