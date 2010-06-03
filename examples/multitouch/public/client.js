var circles;

function longPoll() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(event) {
      if (req.readyState == 4) {
          if(req.status == 200){
              JSON.parse(req.responseText).forEach(function (message) {
                  circles[message.id].attr(message.attr);
              });
              longPoll();
          } else {
              setTimeout(longPoll, 10000);
          }
      }
    };
    req.open('GET', '/stream', true);                  
    req.send(); 
}

window.onload = function () {
    var R = Raphael(0, 0, "100%", "100%"),
        r = R.circle(100, 100, 50).attr({fill: "hsb(0, 1, 1)", stroke: "none", opacity: 0.5}),
        g = R.circle(210, 100, 50).attr({fill: "hsb(.3, 1, 1)", stroke: "none", opacity: 0.5}),
        b = R.circle(320, 100, 50).attr({fill: "hsb(.6, 1, 1)", stroke: "none", opacity: 0.5}),
        p = R.circle(430, 100, 50).attr({fill: "hsb(.8, 1, 1)", stroke: "none", opacity: 0.5});
    circles = [r, g, b, p];
    var start = function () {
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        this.animate({r: 70, opacity: 0.25}, 500, ">");
    },
    move = function (dx, dy) {
        var loc = {cx: this.ox + dx, cy: this.oy + dy};
        // this.attr(loc);
        var req = new XMLHttpRequest();
        req.open('POST', '/stream', true);                  
        req.setRequestHeader("Content-Type", "application/json"); 
        req.send(JSON.stringify({id: this.id, attr: loc})); 
    },
    up = function () {
        this.animate({r: 50, opacity: 0.5}, 500, ">");
    };
    R.set(r, g, b, p).drag(move, start, up);
    longPoll();
};
