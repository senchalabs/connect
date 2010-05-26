
function Map(data)
{
	this.grid = data.grid;
	this.start = data.start;
	this.secrets = data.secrets;
	this.blocks = data.blocks;
	this.blockset = data.blockset;
	this.background = data.background;
	this.description = data.description;
	this.height = this.grid.length;
	this.width = this.grid[0].length;
	this.coins = {};


	for (i in this.blocks) if (this.blocks.hasOwnProperty(i))
	{
		if (this.blocks[i].item)
		{
			this.coins[i] = 0;
		}
	}
	
	// TODO: load from external file?
	this.player = {
		image: [
			{shape: "circle", fill: "#ff0", stroke: "#000", cx: 24, cy: 24, r: 24},
			{shape: "polygon", fill: "#f00", stroke:"#000", points: [
			[24.000001,7.9936058e-15],[31.053423,14.291796],[46.825357,16.583593],
			[35.412678,27.708204],[38.106846,43.416408],[24,36],[9.8931534,43.416407],
			[12.587322,27.708204],[1.1746438,16.583592],[16.946577,14.291796],
			[24.000001,7.9936058e-15]]}
		]
	};
	this.secret_image = [
		{"shape": "rect", "fill": "rgba(255,0,0,0.30)", "x": 14, "y": 14, "width": 20, "height": 20},
		{"shape": "rect", "stroke": "rgba(255,0,0,0.60)", "x": 0.5, "y": 0.5, "width": 47, "height": 47},
	];
	

	// Draw the level
	this.frame_div = document.getElementById('frame');
	this.highlight_canvas = document.getElementById('highlight');
	if (this.highlight_canvas) this.highlight_ctx = this.highlight_canvas.getContext('2d');
	this.secrets_canvas = document.getElementById('secrets');
	if (this.secrets_canvas) this.secrets_ctx = this.secrets_canvas.getContext('2d');
	this.map_canvas = document.getElementById('map');
	this.map_ctx = this.map_canvas.getContext('2d');
	this.backdrop_canvas = document.getElementById('backdrop');
	this.backdrop_ctx = this.backdrop_canvas.getContext('2d');
	this.player_canvas = document.getElementById('player');
	this.player_ctx = this.player_canvas.getContext('2d');
	this.wipeLevel();
	this.map_canvas.width = this.width * 48;
	this.map_canvas.height = this.height * 48;
	this.backdrop_canvas.width = this.width * 48;
	this.backdrop_canvas.height = this.height * 48;
	if (this.highlight_canvas)
	{
		this.highlight_canvas.width = this.width * 48;
		this.highlight_canvas.height = this.height * 48;
	}
	if (this.secrets_canvas)
	{
		this.secrets_canvas.width = this.width * 48;
		this.secrets_canvas.height = this.height * 48;
	}
	this.player_canvas.width = 48;
	this.player_canvas.height = 48;

	this.movePlayer(this.start[0], this.start[1], 0);
	$('description').innerHTML = data.description;


	if (data.background)
	{
		this.drawImage(data.background, this.backdrop_ctx);
	}
	for (var y=0; y < this.height; y++)
	{
		for (var x=0; x < this.width; x++)
		{
			var type = this.grid[y][x];
			if (this.blocks[type].item) { this.coins[type]++; }
			if (this.blocks[type].image)
			{
				var ctx = this.map_ctx;
				ctx.save();
				ctx.translate(x * 48, y * 48);
				this.drawImage(this.blocks[type].image, ctx);
				ctx.restore();
			}
		}
	}
	if (this.secrets_canvas)
	{
		for (x in this.secrets) if (this.secrets.hasOwnProperty(x) && !isNaN(parseInt(x)))
		{
			for (y in this.secrets[x]) if (this.secrets[x].hasOwnProperty(y))
			{
				var ctx = this.secrets_ctx;
				ctx.save();
				ctx.translate(x * 48, y * 48);
				this.drawImage(this.secret_image, ctx);
				ctx.restore();
			}
		}
	}
}
Map.prototype = {
	viewWidth: 20 * 48,
	viewHeight: 11 * 48,
	viewRatio: 20.0/11.0,
	movePlayer: function (x, y, angle)
	{
		var px = x * 48 + 24;
		var py = y * 48 + 24;
		
		// move the canvas
		this.frame_div.scrollLeft = px - window.frameWidth/2;
		this.frame_div.scrollTop = py - window.frameHeight/2;
		this.player_canvas.style.left = (px-this.frame_div.scrollLeft)+"px";
		this.player_canvas.style.top = (py-this.frame_div.scrollTop)+"px";

		// Redraw the player to spin
		this.player_ctx.clearRect(0,0,48,48);
		this.player_ctx.save();
		this.player_ctx.translate(24,24);
		this.player_ctx.rotate(angle/180*Math.PI);
		this.player_ctx.translate(-24,-24);
		this.drawImage(this.player.image, this.player_ctx);
		this.player_ctx.restore();
		
	},
	clearHighlight: function ()
	{
		ctx = this.highlight_ctx;
		ctx.clearRect(0,0,48*this.width,48*this.height);
	},
	highlight: function (x, y, set)
	{
		ctx = this.highlight_ctx;
		ctx.save();
		ctx.translate(x * 48, y * 48);
		if (set)
		{
			this.drawImage([{"shape": "rect", "fill": "rgba(200,220,255,0.3)", "x": 0, "y": 0, "width": 48, "height": 48}], ctx);
		}
		else
		{
			ctx.clearRect(0,0,48,48);
		}
		ctx.restore();
	},
	setBlock: function (x, y, type)
	{
		var oldtype = this.grid[y][x];
		if (this.blocks[oldtype].item)
		{
			this.coins[oldtype]--;
		}
		if (this.blocks[oldtype].image)
		{
			this.map_ctx.clearRect(x*48,y*48,48,48);
		}
		this.grid[y][x] = type;
		if (this.blocks[type].item) { this.coins[type]++; }
		var options = this.blocks[type].image;
		if (options)
		{
			var ctx = this.map_ctx;
			ctx.save();
			ctx.translate(x * 48, y * 48);
			this.drawImage(options, ctx);
			ctx.restore();
		}
		return oldtype;
	},
	getBlock: function (x, y)
	{
		return this.blocks[this.getBlockType(x, y)];
	},
	getBlockType: function (x, y)
	{
		if (y < 0) { return 0; }
		if (y >= this.height) { return 1; }
		x = (x + this.width) % this.width;
		return this.grid[y][x];
	},
	explode: function (x, y)
	{
		var type=this.grid[y][x];
		this.coins[type]--;
		this.grid[y][x] = 0;
		this.map_ctx.clearRect(x*48,y*48,48,48);
	},
	wipeLevel: function ()
	{
		this.backdrop_ctx.clearRect(0,0,this.width*48,this.height*48);
		this.map_ctx.clearRect(0,0,this.width*48,this.height*48);
	},
	makeColor: function(color, ctx)
	{
		switch (color.type)
		{
			case "radial_gradient":
				var radgrad = ctx.createRadialGradient(color.x1,color.y1,color.r1,color.x2,color.y2,color.r2);
				var grad = color.stops;
				for (i in grad) if (grad.hasOwnProperty(i))
				{
					radgrad.addColorStop(grad[i][0], grad[i][1]);
				}
				return radgrad;
			break;
			case "linear_gradient":
				var lingrad = ctx.createLinearGradient(color.x,color.y,color.width,color.height);
				var grad = color.stops;
				for (i in grad) if (grad.hasOwnProperty(i))
				{
					lingrad.addColorStop(grad[i][0], grad[i][1]);
				}
				return lingrad;
			break;
		}
		return color;
	},
	drawImage: function(image, ctx)
	{
		for (i in image) if (image.hasOwnProperty(i))
		{
			this.drawShape(image[i], ctx);
		}
	},
	drawShape: function(shape, ctx)
	{
		ctx.save();
		ctx.lineJoin = "round";
		ctx.lineWidth = 1.0;

		switch(shape.shape)
		{
			case 'rect':
				if (shape.fill)
				{
					ctx.fillStyle = this.makeColor(shape.fill, ctx);
					ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
				}
				if (shape.stroke)
				{
					ctx.strokeStyle = this.makeColor(shape.stroke, ctx);
					ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
				}
			break;
			case "circle":
				if (shape.fill)
				{
					ctx.fillStyle = this.makeColor(shape.fill, ctx);
					ctx.beginPath();
					ctx.arc(shape.cx, shape.cy, shape.r, 0, 2 * Math.PI, true);
					ctx.fill();
				}
				if (shape.stroke)
				{
					ctx.strokeStyle = this.makeColor(shape.stroke, ctx);
					ctx.beginPath();
					ctx.arc(shape.cx, shape.cy, shape.r, 0, 2 * Math.PI, true);
					ctx.stroke();
				}
			break;
			case "polygon":
				var points = shape.points;
				function tracePoly()
				{
					var first = true;
					ctx.beginPath();
					for (i in points) if (points.hasOwnProperty(i))
					{
						if (first)
						{
							ctx.moveTo(points[i][0],points[i][1]);
							first = false;
						}
						else
						{
							ctx.lineTo(points[i][0],points[i][1]);
						}
					}
				}
				if (shape.fill)
				{
					ctx.fillStyle = this.makeColor(shape.fill, ctx);
					tracePoly();
					ctx.fill();
				}
				if (shape.stroke)
				{
					ctx.strokeStyle = this.makeColor(shape.stroke, ctx);
					tracePoly();
					ctx.closePath();
					ctx.stroke();
				}
			break;
			default:
				//console.log(shape);
			break;
		}
		ctx.restore();
	}
};

