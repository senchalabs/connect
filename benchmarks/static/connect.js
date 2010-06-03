
require('../../lib/connect').createServer([
    { provider: 'static', root: __dirname + '/../public' }
]).listen(3000);