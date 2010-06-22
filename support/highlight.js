
/**
 * Module dependencies.
 */

require.paths.unshift(__dirname + '/koala/lib');
var koala = require('koala'),
    fs = require('fs'),
    file = process.argv[2];

if (file) {
    fs.readFile(file, 'utf8', function(err, str){
        str = str.replace(/<code>([^]+?)<\/code>/g, function(_, code){
            return looksLikeJavaScript(code)
                ? '<code class="js">' + koala.render('.js', code) + '</code>'
                : '<code>' + code + '</code>';
        });
        fs.writeFile(file, str, 'utf8');
    });
} else {
    throw new Error('file required.');
}

function looksLikeJavaScript(code){
    return code.indexOf('{') >= 0
        && code.indexOf('(') >= 0;
}