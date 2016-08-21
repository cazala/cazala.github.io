function Fish(mass, x, y, color)
{
	this.ID = Fish.uid();
	this.mass = mass;
	this.maxspeed = 12 * this.mass;
	this.maxforce = .1 / this.mass;
	this.separationRange = this.mass * 30;
	this.lookRange = this.mass * 200;
	this.length = mass * 20;
	this.base = this.length * .5;
	this.HALF_PI = Math.PI * .5;
	this.RAD_TO_DEG = 57.29577951308232;
	this.location = new Vector(x, y);
	this.velocity = new Vector(0, 0);
	this.acceleration = new Vector(0, 0);
	this.wandering = new Vector(.2,.2);
	this.color = color || "#000000";
}
(function(){
	var id = 0;
	Fish.uid = function()
	{
		return id++;
	}
})();

Fish.prototype = {
	draw: function(ctx)
	{
		this.drawBehavior(ctx);

		if (ctx instanceof CanvasRenderingContext2D) // canvas
		{
			var angle = this.velocity.angle();

			x1 = this.location.x + Math.cos(angle) * this.base;
			y1 = this.location.y + Math.sin(angle) * this.base;

			x = this.location.x - Math.cos(angle) * this.length;
			y = this.location.y - Math.sin(angle) * this.length;

			x2 = this.location.x + Math.cos(angle + this.HALF_PI) * this.base;
			y2 = this.location.y + Math.sin(angle + this.HALF_PI) * this.base;

			x3 = this.location.x + Math.cos(angle - this.HALF_PI) * this.base;
			y3 = this.location.y + Math.sin(angle - this.HALF_PI) * this.base;

			ctx.lineWidth = 2;
			ctx.fillStyle = this.color;
			ctx.strokeStyle = this.color;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.quadraticCurveTo(x2,y2,x,y);
			ctx.quadraticCurveTo(x3,y3,x1,y1);
			ctx.stroke();
			ctx.fill();
		} 
		else // svg
		{ 			
			if (this.svg)
			{
				var angle = this.velocity.angle() * this.RAD_TO_DEG ; // 360 / 2*PI
				this.svg.transform("");
				this.svg.transform("t"+this.location.x+","+this.location.y+"r"+angle);
				this.svg.attr({
					"stroke": this.color,
					"fill": this.color
				});
				this.svg.toFront();
			} else {

				var angle = 0;

				x1 = Math.cos(angle) * this.base;
				y1 = Math.sin(angle) * this.base;

				x = -(Math.cos(angle) * this.length);
				y = -(Math.sin(angle) * this.length);

				x2 = Math.cos(angle + this.HALF_PI) * this.base;
				y2 = Math.sin(angle + this.HALF_PI) * this.base;

				x3 = Math.cos(angle - this.HALF_PI) * this.base;
				y3 = Math.sin(angle - this.HALF_PI) * this.base;

				var path = "M" + [x1, y1].join(",");
				path += "Q" + [x2,y2,x,y].join(",");
				path += "Q" + [x3,y3,x1,y1].join(",");
				path += "Z";

				this.svg = ctx.path(path).attr({
					'fill': this.color,
					'stroke': this.color,
					'stroke-width': 2

				});
			}
		}
	},
	drawBehavior: function(ctx)
	{
		if (Fish.showBehavior)
		{
			var old = ctx.globalAlpha;
			ctx.globalAlpha = .2;
			if (this.avoidList && this.avoidList.length)
			{
				if (this.svg)
				{
					var path = "";
					for(var i in this.avoidList)
					{
						path += "M" + this.location.x + "," + this.location.y;
						path += "L" + this.avoidList[i].location.x + "," + this.avoidList[i].location.y;
					}

					if (this.avoidSVG)
						this.avoidSVG.attr("path", path);
					else
						this.avoidSVG = ctx.path(path).attr({
							'stroke': 'blue',
							'stroke-width': 2,
							'stroke-opacit': .5
						});
				} else {
					ctx.strokeStyle = "blue";
					ctx.lineWidth = 4;
					ctx.beginPath();
					for(var i in this.avoidList)
					{
						ctx.moveTo(this.location.x, this.location.y);
						ctx.lineTo(this.avoidList[i].location.x, this.avoidList[i].location.y);
					}
					ctx.stroke();
				}
			} else if (this.svg && this.avoidSVG)
			{
				this.avoidSVG.remove()
				this.avoidSVG = null;
			}
			if (this.chaseList && this.chaseList.length)
			{
				if (this.svg)
				{
					var path = "";
					for(var i in this.chaseList)
					{
						path += "M" + this.location.x + "," + this.location.y;
						path += "L" + this.chaseList[i].location.x + "," + this.chaseList[i].location.y;
					}

					if (this.chaseSVG)
						this.chaseSVG.attr("path", path);
					else
						this.chaseSVG = ctx.path(path).attr({
							'stroke': 'red',
							'stroke-width': 2,
							'stroke-opacit': .5
						});
				} else {
					ctx.strokeStyle = "red";
					ctx.lineWidth = 4;
					ctx.beginPath();
					for(var i in this.chaseList)
					{
						ctx.moveTo(this.location.x, this.location.y);
						ctx.lineTo(this.chaseList[i].location.x, this.chaseList[i].location.y);
					}
					ctx.stroke();
				}
			} else if (this.svg && this.chaseSVG)
			{
				this.chaseSVG.remove()
				this.chaseSVG = null;
			}
			if (this.shoalList && this.shoalList.length)
			{
				if (this.svg)
				{
					var path = "";
					for(var i in this.shoalList)
					{
						path += "M" + this.location.x + "," + this.location.y;
						path += "L" + this.shoalList[i].location.x + "," + this.shoalList[i].location.y;
					}

					if (this.shoalSVG)
						this.shoalSVG.attr("path", path);
					else
						this.shoalSVG = ctx.path(path).attr({
							'stroke': 'black',
							'stroke-width': 1,
							'stroke-opacit': .5
						});
				} else {
					ctx.lineWidth = 1;
					ctx.strokeStyle = "black";
					ctx.beginPath();
					for(var i in this.shoalList)
					{
						ctx.moveTo(this.location.x, this.location.y);
						ctx.lineTo(this.shoalList[i].location.x, this.shoalList[i].location.y);
					}
					ctx.stroke();
				}
			}else if (this.svg && this.shoalSVG)
			{
				this.shoalSVG.remove()
				this.shoalSVG = null;
			}
			this.avoidList = null;
			this.chaseList = null;
			this.shoalList = null;
			ctx.globalAlpha = old;
		} else {
			this.color = "black";
			if (this.svg){
				if(this.avoidSVG)
				{
					this.avoidSVG.remove()
					this.avoidSVG = null;
				}
				if(this.chaseSVG)
				{
					this.chaseSVG.remove()
					this.chaseSVG = null;
				}
				if(this.shoalSVG)
				{
					this.shoalSVG.remove()
					this.shoalSVG = null;
				}
			}
		}
	},
	update: function()
	{
		this.velocity.add(this.acceleration);
	    this.velocity.limit(this.maxspeed);
	    if(this.velocity.mag() < 2)
	    	this.velocity.setMag(5);
	    this.location.add(this.velocity);
	    this.acceleration.mul(0);
	},
	applyForce: function(f)
	{
		this.acceleration.add(f);
	},
	boundaries: function(world)
	{
		if (this.location.x < 50)
			this.applyForce(new Vector(this.maxforce*3, 0));

		if (this.location.x > world.width - 50)
			this.applyForce(new Vector(-this.maxforce*3, 0));

		if (this.location.y < 50)
			this.applyForce(new Vector(0, this.maxforce*3));

		if (this.location.y > world.height - 50)
			this.applyForce(new Vector(0, -this.maxforce*3));

	},
	look: function (creatures, radius, angle)
	{
		var neighboors = [];
		for (var i in creatures)
			if (creatures[i] != this)
			{
				var diff = this.location.copy().sub(creatures[i].location);
				var a = this.velocity.angleBetween(diff);
				var d = this.location.dist(creatures[i].location);
				if (d < radius && (a < angle/2 || a > Math.PI * 2 - angle/2))
					neighboors.push(creatures[i]);
			}
				
		return neighboors;
	},
	wander: function(radius)
	{
		if (Math.random() < .05) {
			this.wandering.rotate(Math.PI * 2 * Math.random());
		}
		this.velocity.add(this.wandering);

		if (Fish.showBehavior)
			this.color = "gray";
	},
	chase: function(creatures)
	{
		this.chaseList = creatures;

		if (creatures.length == 0)
			return;

		for (var i in creatures)
			this.applyForce(creatures[i].attract(this, 50));

		if (Fish.showBehavior)
			this.color = "red";

	},
	follow: function(target, arrive)
	{
			var dest = target.copy().sub(this.location);
			var d = dest.dist(this.location);

			if (d < arrive)
				dest.setMag(d/arrive*this.maxspeed);
			else 
				dest.setMag(this.maxspeed);

			this.applyForce(dest.limit(this.maxforce*2));
	},
	seek: function(target)
	{
		var seek = target.copy().sub(this.location)
		seek.normalize();
		seek.mul(this.maxspeed);
		seek.sub(this.velocity).limit(this.maxforce);
		
		return seek;
	},
	attract: function(body, f)
	{
		var force = this.location.copy().sub(body.location);
	    var distance = force.mag();
	    distance = distance < 5 ? 5 : distance > 25 ? 25 : distance;
	    force.normalize();
	 
	    var strength = (f * this.mass * body.mass) / (distance * distance);
	    force.mul(strength);
	    return force;
	},
	separate: function(neighboors, range)
	{
		var sum = new Vector(0,0);

		if (neighboors.length)
		{
			for (var i in neighboors)
			{
				var d = this.location.dist(neighboors[i].location)
				if (d < range)
				{
					var diff = this.location.copy().sub(neighboors[i].location);
					diff.normalize();
					diff.div(d);
					sum.add(diff);
				}
			}	
			sum.div(neighboors.length);
			sum.normalize();
			sum.mul(this.maxspeed);
			sum.sub(this.velocity)
			sum.limit(this.maxforce);
		}

		return sum;
	},
	align: function(neighboors)
	{
		var sum = new Vector(0,0);

		if (neighboors.length)
		{
			for (var i in neighboors)
			{
				sum.add(neighboors[i].velocity);
			}	
			sum.div(neighboors.length);
			sum.normalize();
			sum.mul(this.maxspeed);

			sum.sub(this.velocity).limit(this.maxspeed);
		}

		return sum;
	},
	cohesion: function(neighboors)
	{
		var sum = new Vector(0,0);

		if (neighboors.length)
		{
			for (var i in neighboors)
			{
				sum.add(neighboors[i].location);
			}	
			sum.div(neighboors.length);
			return this.seek(sum);
		}

		return sum;
	},
	shoal: function(neighboors)
	{
		this.shoalList = neighboors;

		var sep = this.separate(neighboors, this.separationRange).limit(this.maxforce);
		var ali = this.align(neighboors).limit(this.maxforce);
		var cohe = this.cohesion(neighboors).limit(this.maxforce);

		sep.mul(1.4);
		ali.mul(1.2);
		cohe.mul(1);

		this.applyForce(sep);
		this.applyForce(ali);
		this.applyForce(cohe);

		if (Fish.showBehavior)
			this.color = "black";
	},
	avoid: function(creatures, dist)
	{
		this.avoidList = creatures;
		for(var i in creatures)
		{
			var d = this.location.dist(creatures[i].location)
			if (d < dist)
			{
				var v = creatures[i].location.copy().sub(this.location).mul(-100);
				this.applyForce(v);
			}
		}

		if (Fish.showBehavior)
			this.color = "blue";
	}
}

Fish.showBehavior = false;