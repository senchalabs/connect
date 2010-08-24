var circles;
var localID = Math.floor(Math.random()*1024*1024);

function longPoll() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(event) {
      if (req.readyState == 4) {
          if(req.status == 200) {
              var message = JSON.parse(req.responseText);
              for (var id in message.locs) {
                  circles[id].attr(message.locs[id]);
              };
              longPoll();
          } else {
              setTimeout(longPoll, 10000);
          }
      }
    };
    req.open('GET', '/stream/' + localID, true);
    req.send();
}

var pending = false;
var locs = {};
function start() {
    var R = Raphael(0, 0, "100%", "100%"),
        r = R.circle(512, 200, 120).attr({fill: "hsb(0, 1, 1)", stroke: "none", opacity: 0.9}),
        g = R.circle(328, 384, 120).attr({fill: "hsb(.3, 1, 1)", stroke: "none", opacity: 0.9}),
        b = R.circle(696, 384, 120).attr({fill: "hsb(.6, 1, 1)", stroke: "none", opacity: 0.9}),
        p = R.circle(512, 558, 120).attr({fill: "hsb(.8, 1, 1)", stroke: "none", opacity: 0.9});
    circles = [r, g, b, p];
    var start = function () {
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
        this.animate({r: 150, opacity: 0.25}, 500, ">");
    },
    move = function (dx, dy) {
        var loc = {cx: this.ox + dx, cy: this.oy + dy};
        this.attr(loc);
        locs[this.id] = loc;

        function send() {
            if (pending) {
                return;
            }
            if (JSON.stringify(locs) === "{}") {
                return;
            }
            var req = new XMLHttpRequest();
            req.onreadystatechange = function(event) {
                pending = false;
                setTimeout(send, 10);
            };
            req.open('POST', '/stream/' + localID, true);
            req.setRequestHeader("Content-Type", "application/json");
            req.send(JSON.stringify({sender: localID, locs: locs}));
            pending = true;
            locs = {};
        }
        send();
    },
    up = function () {
        this.animate({r: 120, opacity: 0.9}, 500, ">");
    };
    R.set(r, g, b, p).drag(move, start, up);
    setTimeout(longPoll, 1000);
};

window.onload = start;
