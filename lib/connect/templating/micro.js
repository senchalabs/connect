// A simple templating solution using <code>with(){}</code> for simplified templates.
// John Resig - http://ejohn.org/ - MIT Licensed
// Modified for node.JS by Tim Caswell <tim@extjs.com>

module.exports = function Micro(str){
  // Generate a reusable function that will serve as a template
  // generator (and which will be cached).
  return new Function("locals",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +
      
      // Introduce the data as local variables using with(){}
      "with(locals){p.push('" +
      
      // Convert the template into pure JavaScript
      str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
    + "');}return p.join('');");
};