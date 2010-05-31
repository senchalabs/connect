
document.addEventListener('DOMContentLoaded', function(){
    var debug = new Debug();
    var requestPanel = debug.addPanel('Request', function(panel){
        panel.appendChild(createTable(req.headers));
    });
    var responsePanel = debug.addPanel('Response', function(panel){
        panel.appendChild(createTable(res.headers));
    });
    debug.showPanel(requestPanel);
});

/**
 * Debug panel constructor.
 */

function Debug(){
    var self = this,
        debug = document.createElement('div'),
        body = document.getElementsByTagName('body')[0];
    debug.setAttribute('id', 'debug');
    debug.innerHTML = '<div id="debug-header">'
        + '<h2>Connect Debug</h2>'
        + '<ul id="debug-tabs"></ul>'
        + '</div>'
        + '<div id="debug-container"></div>';
    debug.style.height = 0;
    body.appendChild(debug);
    document.addEventListener('keydown', function(event){
       if (event.keyCode === 192) {
           self.toggleDisplay();
       } 
    });
    this.tabs = document.getElementById('debug-tabs');
    this.container = document.getElementById('debug-container');
    this.element = debug;
}

/**
 * Add a panel with the given title and setup function.
 *
 * @param  {String} title
 * @param  {Function} fn
 * @return {HTMLDivElement}
 * @api public
 */

Debug.prototype.addPanel = function(title, fn){
    var panel = document.createElement('div');
    panel.setAttribute('id', 'debug-' + title.toLowerCase());
    fn.call(this, panel);
    this.addTab(title, panel);
    return panel;
};

/**
 * Add a tab with the given title and panel element.
 *
 * @param  {String} title
 * @param  {HTMLDivElement} panel
 * @api public
 */

Debug.prototype.addTab = function(title, panel){
    var self = this,
        tab = document.createElement('li'),
        a = document.createElement('a');
    a.setAttribute('href', '#');
    a.innerText = title;
    tab.appendChild(a);
    this.tabs.appendChild(tab);
    a.addEventListener('click', function(event){
        self.showPanel(panel);
    });
};

/**
 * Show the given panel.
 *
 * @param  {HTMLDivElement} panel
 * @api public
 */

Debug.prototype.showPanel = function(panel){
    if (this.previousPanel) {
        this.container.removeChild(this.previousPanel);
    }
    this.previousPanel = panel;
    this.container.appendChild(panel);
};

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
    var self = this,
        height = parseInt(this.element.style.height, 10);
    var id = setInterval(function(){
        if ((height -= 40) >= 0) {
            self.element.style.height = height;
        } else {
            clearInterval(id);
        }
    }, 10); 
};

/**
 * Create a table from the given object,
 * and title string.
 *
 * @param  {Object} obj
 * @param  {String} title
 * @return {HTMLTableElement}
 * @api private
 */

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
};