function Init()
{
	OnWindowResize();
	Restart();
}

function Restart()
{
	Engine.stopEngine();
	window.map = new Map(window.map_data)
	Engine.startEngine(window.map);
}

function Die()
{
	Engine.stopEngine();
	alert("You Died");
	Restart();
}

function Win(message, next_level_owner, next_level_name)
{
	Engine.stopEngine();
	alert(message);
	window.location = "/" + next_level_owner + "/" + next_level_name;
}

function OnWindowResize()
{
	window.frameWidth = window.innerWidth;
	window.frameHeight = window.innerHeight;
}
