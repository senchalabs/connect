
function Engine(map)
{
	this.map = map;
	var self = this;  // To make referencing the engine object easier
	this.height = this.map.height;
	this.width = this.map.width;
	this.spin = 0.0;
	this.x = map.start[0];
	this.y = map.start[1];
	this.ox = this.x;
	this.oy = this.y;
	this.mx = 0;
	this.my = 0;
	this.angle = 0;
	this.oangle = this.angle;
	this.keyFrame = 0;
	this.j = 0;
	this.clock = 0;
	this.keyDown = null;
	this.moveKeys = {
		up: false,
		right: false,
		down: false,
		left: false,
		upStill: false,
		rightStill: false,
		downStill: false,
		leftStill: false
	};
	this.TURN = 360 / Math.PI;


	// initialize event processing:
	document.documentElement.addEventListener("keydown", function(evt) { self.keyHandler(evt, true); }, false);
	document.documentElement.addEventListener("keyup", function(evt) { self.keyHandler(evt, false); }, false);

	// Define the main loop
	function mainLoop()
	{
		self.clock = (self.clock + 1) % self.frames;
		if (self.clock == self.keyFrame)
		{
			self.interpretKeys();
		}
		if (self.clock === 0)
		{
			self.doLogic();
		}
		var percent = self.clock / self.frames;
		var rx = self.ox * (1 - percent) + self.x * percent;
		var ry = self.oy * (1 - percent) + self.y * percent;
		var rangle = self.oangle * (1 - percent) + self.angle * percent + 3;
		map.movePlayer(rx, ry, rangle);
	}

	// Start the main loop
	mainLoop();
	window.gameTimer = setInterval(function() {mainLoop();}, self.interval / self.frames);
}


Engine.startEngine = function (map)
{
	window.engine = new Engine(map);
};

Engine.stopEngine = function ()
{
	if (window.gameTimer)
	{
		clearInterval(window.gameTimer);
	}
	if (window.engine)
	{
		delete window.engine;
	}
};

Engine.prototype = {
	frames: 6.0,
	interval: 150,
	interpretKeys: function ()
	{
		this.mx = ((this.moveKeys.left||this.moveKeys.leftStill)?-1:0) + ((this.moveKeys.right||this.moveKeys.rightStill)?1:0);
		this.my = ((this.moveKeys.up||this.moveKeys.upStill)?-1:0) + ((this.moveKeys.down||this.moveKeys.downStill)?1:0);
		this.moveKeys.left = false;
		this.moveKeys.up = false;
		this.moveKeys.right = false;
		this.moveKeys.down = false;
	},
	doLogic: function ()
	{
		this.oangle = this.angle;
		this.ox = this.x;
		this.oy = this.y;
	
		this.checkSecrets();

		this.doMovement();

		var initialNumpad = this.delta2numpad(this.x - this.ox, this.y - this.oy);
		this.checkBounds();
		this.checkWalls();
		this.checkBounds();
		var finalNumpad = this.delta2numpad(this.x - this.ox, this.y - this.oy);
	
		// bumping head stops jump
		if (this.j > 0 && this.y >= this.oy)
		{
			this.j = 0;
		}

		if (this.map.getBlock(this.x, this.y).jumpable)
		{
			this.spin = this.spin * 0.4;
		}
		else
		{
			this.spin = this.spin * 0.9;
		}
		
		if (finalNumpad != initialNumpad)
		{
			if (finalNumpad != 5)
			{
				this.spin = (this.rotationIndex[initialNumpad] - this.rotationIndex[finalNumpad]);
				if (this.spin < -4) { this.spin += 8; }
			}
			else
			{
				this.spin = this.mx;
			}
		}
		this.angle = parseInt(this.angle + this.spin * this.TURN);
	},
	// This translates from a movement delta to number pad codes
	// Ex: delta2numpad(-1, 1) == 1 (bottom left)
	delta2numpad: function (dx, dy)
	{
		if (dx > 1) dx -= this.width;
		if (dx < -1) dx += this.width;
		return 5 + dx - 3 * dy;
	},
	// This translates from number pad code to movement delta
	// Ex: numpad2delta[4] = [-1,0] (Left)
	numpad2delta: {
		1:[-1,1],
		2:[0,1],
		3:[1,1],
		4:[-1,0],
		5:[0,0],
		6:[1,0],
		7:[-1,-1],
		8:[0,-1],
		9:[1,-1]
	},
	rotationIndex: {
		1:6,
		2:5,
		3:4,
		4:7,
		6:3,
		7:0,
		8:1,
		9:2
	},
	cornerCheck: {
		1:[[-1,0,3],[0,1,7]],
		3:[[1,0,1],[0,1,9]],
		7:[[-1,0,9],[0,-1,1]],
		9:[[1,0,7],[0,-1,3]]
	},
	blockMove: {
		1:[2,4],
		2:[],
		3:[2,6],
		4:[],
		5:[2,8,1,3,7,9,4,6],
		6:[],
		7:[4,8],
		8:[],
		9:[6,8]
	},
	keyHandler: function (event, isDown) {
		var used = true;
		if (isDown)
		{
			switch (event.keyCode)
			{
				case (37): // LEFT
					this.moveKeys.left = true;
					this.moveKeys.leftStill = true;
				break;
				case (38): // UP
					this.moveKeys.up = true;
					this.moveKeys.upStill = true;
				break;
				case (39): // RIGHT
					this.moveKeys.right = true;
					this.moveKeys.rightStill = true;
				break;
				case (40): // DOWN
					this.moveKeys.down = true;
					this.moveKeys.downStill = true;
				break;
				default:
					used = false;
				break;
			}
		}
		else
		{
			switch (event.keyCode)
			{
				case (37): // LEFT
					this.moveKeys.leftStill = false;
				break;
				case (38): // UP
					this.moveKeys.upStill = false;
				break;
				case (39): // RIGHT
					this.moveKeys.rightStill = false;
				break;
				case (40): // DOWN
					this.moveKeys.downStill = false;
				break;
				default:
					used = false;
				break;
			}
		}
		if (used)
		{
			event.preventDefault();
		}
	},
	checkSecrets: function ()
	{
		if (this.map.getBlock(this.x, this.y).item)
		{
			this.map.explode(this.x, this.y);
			this.checkItems();
			this.executeSecret(this.x, this.y);
		}
		this.checkItems();

		if (this.map.getBlock(this.x, this.y).kill)
		{
			Die();
		}
	},
	executeSecret: function (x, y)
	{
		if (this.map.secrets && this.map.secrets[x] && this.map.secrets[x][y])
		{
			var secret = this.map.secrets[x][y];
			
			if (secret.set)
			{
				for (var i=0; i<secret.set.length;  i++)
				{
					this.map.setBlock(secret.set[i][0],secret.set[i][1],secret.set[i][2]);
				}
			}
			if (secret.teleport)
			{
				this.x = secret.teleport[0];
				this.y = secret.teleport[1];
				this.ox = this.x;
				this.oy = this.y;
			}
			if (secret.win)
			{
				Win(secret.win[0], secret.win[1], secret.win[2]);
			}
		}
	},
	checkItems: function()
	{
		var coins = this.map.coins;
		for (i in coins) if (coins.hasOwnProperty(i))
		{
			if (coins[i] === 0)
			{
				this.executeSecret('finish', i);
				coins[i] = null;
			}
		}
	},
	checkBounds: function ()
	{
		if (this.x < 0) { this.x = this.width - 1; }
		if (this.x > this.width - 1) { this.x = 0; }
	},
	doMovement: function ()
	{
		var omy = this.my;
		if (this.j < 0 && omy>=0) { this.j = null; }
		var jdown = this.map.getBlock(this.x, this.y + 1).jumpable;
		if (this.my < 0 && this.j === null && ((this.y == this.height - 1) || jdown))
		{
			this.j = 3;
			if (jdown > 0)
			{
				this.j = jdown;
			
			}
		}
		if (this.j > 0)
		{
			if (omy>=0) { this.j=0; }
			this.my = -1;
			this.j--;
		}
		else if (this.j === 0)
		{
			this.j = -1;
			this.my = 0;
		}
		else
		{
			this.my = 1;
		}
		if (this.map.getBlock(this.x, this.y).jumpable)
		{
			if (this.mx === 0) { this.j = null; }
			this.my = omy;
		}
		this.x += this.mx;
		this.y += this.my;

	},
	checkWalls: function ()
	{
		var self = this;
		var rejected = {};

		function checkCorner(newnumpad)
		{
			// Check for cutting corners when diagonal
			var parts = self.cornerCheck[newnumpad];
			var safe = [true, true];
			if (parts)
			{
				var c0 = self.map.getBlock(self.ox+parts[0][0],self.oy+parts[0][1]);
				var c1 = self.map.getBlock(self.ox+parts[1][0],self.oy+parts[1][1]);
				if (
					(c0.corners && c0.corners[parts[0][2]]) ||
					(c1.corners && c1.corners[parts[1][2]]))
				{
					rejected[newnumpad] = true;
					return false;
				}
			}
			return true;
		}
		
		function checkSolid()
		{
			var numpad = self.delta2numpad(self.x - self.ox, self.y - self.oy);
			checkCorner(numpad);
			var shape = self.map.getBlock(self.x, self.y);
			if (!shape.solid && !rejected[numpad]) { return true; }
			var allowed;
			if (shape.solid)
			{
				allowed = shape.solid[numpad];
			}
			else
			{
				allowed = self.blockMove[numpad];
			}
			for (var i = 0; i < allowed.length; i++)
			{
				// Ignore ones we already know as bad
				var newnumpad = allowed[i];
				checkCorner(newnumpad);
				if (rejected[newnumpad]) { continue; }
				var delta = self.numpad2delta[newnumpad];
				self.x = self.ox + delta[0];
				self.y = self.oy + delta[1];
				if (!self.map.getBlock(self.x, self.y).solid)
				{
					return true;
				}
				rejected[newnumpad] = true;
				if (checkSolid()) { return true; }
			}
			return false;
		}
	
		if (!checkSolid())
		{
			self.x = self.ox;
			self.y = self.oy;
		}
	}
};

