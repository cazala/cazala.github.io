
$(function()
{
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext('2d');
	var svg = !canvas.getContext || !ctx;
	if (svg)
	{
		ctx = Raphael(document.body, '100%', '100%');
		canvas.remove();
	}
	
	var mouse = new Vector(0, 0);

	var world = {
		width: 0,
		height: 0,
		creatures: []
	}

	var numFish = ($(window).width() / 600) * 50;
	var flag = false;
	var slowmo = false;
	var time = null;
	var interval = 20;
	var alpha = 1

	numFish = numFish > 50 ? 50 : numFish;

	$(window).mousemove(function(e)
	{
		mouse.set(e.clientX, e.clientY);
	}).mousedown(function(){
		flag = true;
		time = new Date();
	}).keyup(function(){
		if (time && (new Date) - time < 500)
			if (slowmo)
				fast();
			else
				slow();
			slowmo = !slowmo;
	}).mouseup(function()
	{
		flag = false;
		Fish.showBehavior = !Fish.showBehavior;
	});

	document.body.addEventListener('touchstart', function(e){
		flag = true;
		var touchobj = e.changedTouches[0];
		mouse.set(touchobj.clientX, touchobj.clientY);
		//e.preventDefault()
	}, false);

	document.body.addEventListener('touchmove', function(e){
		var touchobj = e.changedTouches[0];
		mouse.set(touchobj.clientX, touchobj.clientY);
		e.preventDefault()
	}, false);

	document.body.addEventListener('touchend', function(e){
		flag = false;
		if (e.changedTouches.length >= 2)
			Fish.showBehavior = !Fish.showBehavior;
		//e.preventDefault()
	}, false);

	$(window).resize(function() 
	{
		world.width = $(window).width();
		world.height = $(window).height();

		if (svg){
			ctx.setSize(world.width, world.height);
		} else {
			var e = document.getElementById("canvas");
			e.setAttribute("width", world.width);
			e.setAttribute("height", world.height);
		}
	});

	$(window).resize();

	for (var i = 0; i < numFish; i++)
		world.creatures.push(new Fish(.5 + (Math.random()*Math.random()*Math.random()*Math.random()*2), Math.random() * world.width, Math.random() * world.height));
	
	var timeline = null;

	var timestep = function()
	{
		if (!svg)
		{
			ctx.globalAlpha=0.2 + (0.6 * alpha);
			ctx.fillStyle="#ffffff";
			ctx.fillRect(0,0,canvas.width, canvas.height);
			ctx.globalAlpha = alpha;
		}
		

		for (var i in world.creatures)
		{
			var fish = world.creatures[i];
			if (flag)
				fish.follow(mouse, 150);

			var neighboors = fish.look(world.creatures, 100 * fish.mass, Math.PI*2);

			var friends = [];
			for (var j in neighboors)
			{
				if (neighboors[j].mass < fish.mass * 2 && neighboors[j].mass < fish.mass * 2)
					friends.push(neighboors[j]);
			}

			if (friends.length)
				fish.shoal(neighboors);
			else
				fish.wander(200);
			fish.boundaries(world);
			
			var bigger = [];
			for (var j in neighboors)
			{
				if (neighboors[j].mass > fish.mass * 2)
					bigger.push(neighboors[j]);
			}
			if (bigger.length)
				fish.avoid(bigger, 300);

			var smaller = [];
			for (var j in neighboors)
			{
				if (neighboors[j].mass < fish.mass/2)
					smaller.push(neighboors[j]);
			}
			if (smaller.length)
				fish.chase(smaller);

			world.creatures[i].update(world);
			world.creatures[i].draw(ctx);
		}
	}

	var slow = function()
	{
		timeline && clearInterval(timeline);

		if (interval < 45)
		{
			alpha -= 0.032;
			timestep();
			setTimeout(slow, interval++);
		} else {
			timeline = setInterval(timestep, interval);
		}
	}

	var fast = function()
	{
		timeline && clearInterval(timeline);

		if (interval > 20)
		{
			alpha += 0.032;
			timestep();
			setTimeout(fast, interval--);
		} else {
			alpha = 1;
			timeline = setInterval(timestep, interval);
		}
	}
	fast();
	setTimeout(function () {
	  window.scrollTo(0, 1);
	}, 1000);
});

