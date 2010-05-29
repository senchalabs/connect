function onWindowResize()
{
	window.frameWidth = window.innerWidth;
	window.frameHeight = window.innerHeight;
}

Event.observe(window, "resize", onWindowResize);

Event.observe(window, 'load', function ()
{
	onWindowResize();
	var map = new Map(window.map_data);
	var editor = new Editor(map);
});

Map.prototype.movePlayer = function (x, y)
{
	var px = x * 48 + 24;
	var py = y * 48 + 24;
	
	// move the canvas
	this.frame_div.scrollLeft = px - window.frameWidth/2;
	this.frame_div.scrollTop = py - window.frameHeight/2;
	this.player_canvas.style.left = (px-this.frame_div.scrollLeft)+"px";
	this.player_canvas.style.top = (py-this.frame_div.scrollTop)+"px";
};

function Editor(map)
{
	this.map = map;
	this.undoBuffer = [];
	this.redoBuffer = [];
	this.selection = {};
	this.copyBuffer = [];
	this.copyLocation = null;
	this.shiftKey = false;
	this.ctrlKey = false;
	this.altKey = false;
	var self = this;  // To make referencing the engine object easier
	this.height = this.map.height;
	this.width = this.map.width;
	this.x = map.start[0];
	this.y = map.start[1];
	this.brush = null;
	// initialize event processing:
	
	document.documentElement.addEventListener("keydown", function(evt) { self.keyHandler(evt, true); }, false);
	document.documentElement.addEventListener("keyup", function(evt) { self.keyHandler(evt, false); }, false);
	window.addEventListener("blur", function(evt) { self.shiftKey=false;self.altKey=false;self.ctrlKey=false; }, false);
}

Editor.prototype.keyHandler = function (event, isDown)
{
	if (isDown)
	{
		if (event.keyCode == 16)
		{
			this.shiftKey = true;
		}
		if (event.keyCode == 17)
		{
			this.ctrlKey = true;
		}
		if (event.keyCode == 18)
		{
			this.altKey = true;
		}
		if (this.processKey(event.keyCode))
		{
			var self = this;
			var keyCode = event.keyCode;
			event.preventDefault();
			clearTimeout(this.repeatTimeout);
			this.repeatTimeout = setTimeout(function(){
				self.processKey(keyCode);
				clearInterval(self.repeatInterval);
				self.repeatInterval = setInterval(function() {
					self.processKey(keyCode);
				}, 60);
			}, 300);
		}
	}
	else
	{
		clearTimeout(this.repeatTimeout);
		clearInterval(this.repeatInterval);
		if (event.keyCode == 16)
		{
			this.shiftKey = false;
		}
		else if (event.keyCode == 17)
		{
			this.ctrlKey = false;
		}
		else if (event.keyCode == 18)
		{
			this.altKey = false;
		}
		else if (this.brush === this.keyToType[event.keyCode])
		{
			this.brush = null;
			event.preventDefault();
		}
	}
};

Editor.prototype.processKey = function (keyCode)
{
	var modifierKey = 
		(this.shiftKey ? 1 : 0) +
		(this.ctrlKey ? 2 : 0) +
		(this.altKey ? 4 : 0);

	var used = true;
	var type = this.keyToType[keyCode];
	if (this.map.blocks[type] && modifierKey == 0)
	{
		this.brush = type;
	}
	else if (keyCode == 37 && modifierKey < 2 )
	{
		this.x--;
	}
	else if (keyCode == 38 && modifierKey < 2)
	{
		this.y--;
	}
	else if (keyCode == 39 && modifierKey < 2)
	{
		this.x++;
	}
	else if (keyCode == 40 && modifierKey < 2)
	{
		this.y++;
	}
	else if (keyCode == 90 && modifierKey == 3)
	{
		this.redo();
	}
	else if (keyCode == 90  && modifierKey == 2)
	{
		this.undo();
	}
	else if (keyCode == 83  && modifierKey == 2)
	{
		this.saveMap();
	}
	else if (keyCode == 88 && modifierKey == 2)
	{
		this.cut();
	}
	else if (keyCode == 67  && modifierKey == 2)
	{
		this.copy();
	}
	else if (keyCode == 86  && modifierKey == 2)
	{
		this.paste();
	}
	else if (
		(keyCode == 72 && modifierKey == 2) ||
		(keyCode == 112 && modifierKey == 0))
	{
		this.showHelp();
	}
	else
	{
		used = false;
		//console.log(keyCode);
	}
	if (this.x < 0) { this.x = 0; }
	if (this.x > this.width - 1) { this.x = this.width - 1; }
	if (this.y < 0) { this.y = 0; }
	if (this.y > this.height - 1) { this.y = this.height - 1; }
	if (this.brush !== null)
	{
		this.clearHighlight();
		this.setBlock(this.x, this.y, this.brush);
	}
	if (modifierKey == 1) { this.highlight(this.x, this.y); }

	this.map.movePlayer(this.x, this.y);
	return used;
};

Editor.prototype.highlight = function (x, y)
{
	if (this.selection[y] && this.selection[y][x])
	{
		delete this.selection[y][x];
		this.map.highlight(x, y, false);
	}
	else
	{
		if(!this.selection[y])
		{
			this.selection[y]={};
		}
		this.selection[y][x]=true;
		this.map.highlight(x, y, true);
	}
};
Editor.prototype.clearHighlight = function ()
{
	this.selection = {};
	this.map.clearHighlight();
};
Editor.prototype.cut = function ()
{
	this.copy();
	this.del();
};
Editor.prototype.del = function ()
{
	for (y in this.selection)  if (this.selection.hasOwnProperty(y))
	{
		for (x in this.selection[y]) if (this.selection[y].hasOwnProperty(x))
		{
			this.setBlock(x, y, 0);
		}
	}
	this.clearHighlight();
};
Editor.prototype.copy = function ()
{
	this.copyBuffer = [];
	for (y in this.selection)  if (this.selection.hasOwnProperty(y))
	{
		y = parseInt(y);
		for (x in this.selection[y]) if (this.selection[y].hasOwnProperty(x))
		{
			x = parseInt(x);
			var entry = [x-this.x, y-this.y, this.map.getBlockType(x, y)];
			this.copyBuffer.push(entry);
		}
	}
};


Editor.prototype.paste = function ()
{
	this.clearHighlight();
	for (i in this.copyBuffer) if (this.copyBuffer.hasOwnProperty(i))
	{
		var item = this.copyBuffer[i];
		this.setBlock(item[0]+this.x, item[1]+this.y, item[2]);
	}
};

Editor.prototype.setBlock = function (x, y, type)
{
	if (x < 0 || y < 0 || x >= this.width || y >= this.height)
	{
		return false;
	}
	var original = this.map.setBlock(x, y, type);
	if (original !== type)
	{
		this.undoBuffer.push([x, y, original]);
		this.redoBuffer = [];
	}
};

Editor.prototype.showHelp = function ()
{
	this.message("Arrow keys to move\nShift+Arrows to Highlight\nNumbers to create blocks\nBackspace and ~ to delete blocks\nCtrl+S - Save\nCtrl+Z - Undo\nCtrl+Shift+Z Redo\nCtrl+C Copy\nCtrl+X Cut\nCtrl+V Paste\nF1 - Show this help");
};

Editor.prototype.undo = function ()
{
	this.clearHighlight();
	this.brush = null;
	var undo = this.undoBuffer.pop();
	if (undo)
	{
		this.x = undo[0];
		this.y = undo[1];
		var original = this.map.setBlock(this.x, this.y, undo[2]);
		this.redoBuffer.push([this.x, this.y, original]);
	}
};

Editor.prototype.message = function(text)
{
	alert(text);
	this.shiftKey = false;
	this.ctryKey = false;
	this.altKey = false;
};

Editor.prototype.redo = function ()
{
	this.clearHighlight();
	this.brush = null;
	var redo = this.redoBuffer.pop();
	if (redo)
	{
		this.x = redo[0];
		this.y = redo[1];
		var original = this.map.setBlock(this.x, this.y, redo[2]);
		this.undoBuffer.push([this.x, this.y, original]);
	}
};


Editor.prototype.keyToType = {
	192: 0,
	8: 0,
	49: 1,
	50: 2,
	51: 3,
	52: 4,
	53: 5,
	54: 6,
	55: 7,
	56: 8,
	57: 9,
	48: 10,
	81: 11,
	87: 12,
	69: 13,
	82: 14,
	84: 15
};

Editor.prototype.saveMap = function ()
{
	var self = this;
	var resource_location = "/"+window.level_owner+"/"+window.level_name;
	var level = {
		grid: this.map.grid,
		background: this.map.background,
		start: [this.x,this.y],
		secrets: this.map.secrets,
		description: this.map.description,
		blockset: this.map.blockset
	};
	new Ajax.Request(resource_location, {
		method: "post",
		contentType: "application/json",
		postBody: Object.toJSON(level),
		onSuccess: function(t) {
			self.message("Level saved");
		},
		onFailure: function(t) {
			self.message("Error saving level!");
		}
	});
};


