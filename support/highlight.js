
/**
 * Module dependencies.
 */

require.paths.unshift(__dirname + '/koala/lib');
var koala = require('koala'),
    sys = require('sys'),
    stdin = process.openStdin();

var str = '';
stdin.addListener('data', function(chunk){
    str += chunk;
});
stdin.addListener('end', function(){
    sys.print(str.replace(/<code>([^]+?)<\/code>/g, function(_, code){
        return looksLikeJavaScript(code)
            ? '<code class="js">' + koala.render('.js', code) + '</code>'
            : '<code>' + code + '</code>';
    }));
});

function looksLikeJavaScript(code){
    return code.indexOf('{') >= 0
        && code.indexOf('(') >= 0;
}