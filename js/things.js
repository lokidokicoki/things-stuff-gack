var LDC = LDC || {};

LDC.Thing = function (uid,x,y) {
	this.uid = uid;
	this.age = 0;
	this.energy = 300;
	this.speed = 1;
	this.eaten = false;
	this.position = [x,y];
	this.selected = false;
};

LDC.ThingManager = (function () {
	var self = null;
	var scale = 1;
	var rad360 = Math.PI * 2;
	var counter = 0;
	var store = {}; //where all thing instance live

	function move(thing) {
		var x = thing.position[0] + (tsg.utils.getRandomInt(0,thing.speed) *  tsg.utils.plusOrMinus());
		var y = thing.position[1] + (tsg.utils.getRandomInt(0,thing.speed) *  tsg.utils.plusOrMinus());
		
		thing.position =[x,y]
		thing.energy -= thing.speed;
	};

	function spawn (x,y,dish) {
		var nx = x + (tsg.utils.getRandomInt(0,1) *  tsg.utils.plusOrMinus());
		var ny = y + (tsg.utils.getRandomInt(0,1) *  tsg.utils.plusOrMinus());
		//console.debug(x, y, nx,ny);
		if (nx < 0 || ny < 0 || nx >= tsg.xlen || ny >= tsg.ylen){
			return false;
		}
		
		var thing = new LDC.Thing(counter++, nx, ny);
		store[thing.uid] = thing;
	};

	// initial populate of grid
	function populate () {
		for (var y = 0; y < tsg.ylen; y++){
			for (var x = 0; x < tsg.xlen; x++){
				var val = tsg.utils.getRandomInt(0,2000);
				if (val === 5){
					var thing = new LDC.Thing(counter++, x,y);
					store[thing.uid] = thing;

				}
			}
		}
	};

	return {
		init : function (cellWidth) {
			self = this;
			scale = cellWidth;
			populate();	
		},

		incubate : function () {
			for (var uid in store){
				var thing = store[uid];
				if (thing && thing !== undefined){
					// spawn
					/*
					if (thing.age%15 == 0) {
						spawn(x,y, next);
					}
					*/

					// eat
					thing.eaten = false;
					if (tsg.stuffMgr.hasStuff(thing.position)){
						thing.energy+=3;
						thing.eaten = true;
						tsg.stuffMgr.killStuff(thing.position);
					}else{
						move(thing);
					}

					// shag
					thing.age++;
					
					// die
					if (thing.energy < 0) {
						store[thing.uid] = null;
						delete thing;
					}
				}
			}
		},

		hasThing : function (point) {
			var thing = null;
			for (var uid in store){
				var t = store[uid];
				if (t.position[0] == point[0] && t.position[1] == point[1])	{
					thing = t;
					break;
				}
			}
			return thing;
		},

		sqr : function (v) {
			return v*v;
		},

		nearest : function (point) {
			var minima = 99999999;
			var result = null;
			for (var uid in store){
				var thing = store[uid];
				thing.selected = false;
				var x2 = Math.abs(point[0] - thing.position[0]);
				var y2 = Math.abs(point[1] - thing.position[1]);
				var dist = Math.sqrt(self.sqr(x2) + self.sqr(y2));
				if (dist < minima) {
					minima = dist;
					result = [thing, dist];	
				}
			}

			return result;
		},

		draw : function (ctx, x,y) {
			for (var uid in store){
				var thing = store[uid];
				if (thing && thing !== undefined){
					var select = 0;
					if (thing.selected){
						select = 255;
						tsg.info(thing);
					}
					ctx.beginPath();
					var fill='';
					var energy = thing.energy;
					if (energy > 200) {
						ctx.fillStyle = "rgb(255,"+select+",0)";
					}else if (energy > 100) { 
						ctx.fillStyle = "rgb(128,"+select+",0)";
					}else{
						ctx.fillStyle = "rgb(64,"+select+",0)";
					}
					ctx.arc(thing.position[0]*scale,thing.position[1]*scale, 1*scale, 0, rad360);
					ctx.fill();
				}
			}
			return ctx;
		}
	}
});
