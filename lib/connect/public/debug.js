
document.addEventListener('DOMContentLoaded', function(){
    var debug = new Debug();
});

function Debug(){
    var self = this,
        debug = document.createElement('div'),
        body = document.getElementsByTagName('body')[0];
    debug.setAttribute('id', 'debug');
    debug.innerHTML = '<div id="debug-tabs"><h2>Connect Debug</h2></div>';
    debug.style.height = 0;
    body.appendChild(debug);
    
    // Toggle console on '`'
    document.addEventListener('keydown', function(event){
       if (event.keyCode === 192) {
           self.toggleDisplay();
       } 
    });
    
    // Request
    var request = createPanel('request', 'Request');
    request.appendChild(createTable(req.headers));
    debug.appendChild(request);
    
    // Response
    var response = createPanel('response', res.statusCode + ' Response');
    response.appendChild(createTable(res.headers));
    debug.appendChild(response);
    this.element = debug;
}

/**
 * Target console height when displayed.
 */

Debug.prototype.targetHeight = 300;

/**
 * Current visibility.
 */

Debug.prototype.visible = false;

/**
 * Toggle display of the debug console.
 *
 * @api public
 */

Debug.prototype.toggleDisplay = function(){
    this.visible = this.visible ? false : true;
    if (this.visible) {
        this.show();
    } else {
        this.hide();
    }
};

/**
 * Show the debug console.
 *
 * @api public
 */

Debug.prototype.show = function(){
    var self = this,
        height = 0;
    var id = setInterval(function(){
        if ((height += 40) <= self.targetHeight) {
            self.element.style.height = height;
        } else {
            clearInterval(id);
        }
    }, 10);
};

/**
 * Hide the debug console.
 *
 * @api public
 */

Debug.prototype.hide = function(){
    this.element.style.height = 0;  
};

function createPanel(name, title){
    var panel = document.createElement('div'),
        h2 = document.createElement('h2');
    h2.innerText = title;
    panel.setAttribute('id', 'debug-' + name);
    panel.appendChild(h2);
    return panel;
}

function createTable(obj, title){
    var table = document.createElement('table');
    for (var key in obj) {
        var tr = document.createElement('tr'),
            keyCell = document.createElement('td'),
            valCell = document.createElement('td');
        keyCell.innerText = key;
        valCell.innerText = obj[key];
        tr.appendChild(keyCell);
        tr.appendChild(valCell);
        table.appendChild(tr);
    }
    return table;
}