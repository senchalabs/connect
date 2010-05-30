
document.addEventListener('DOMContentLoaded', debug);

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

function debug(){
    var debug = document.createElement('div'),
        body = document.getElementsByTagName('body')[0];
    debug.setAttribute('id', 'debug');
    body.appendChild(debug);
    
    // Request
    
    var request = createPanel('request', 'Request');
    request.appendChild(createTable(req.headers));
    debug.appendChild(request);
    
    // Response
    
    var response = createPanel('response', res.statusCode + ' Response');
    response.appendChild(createTable(res.headers));
    debug.appendChild(response);
}