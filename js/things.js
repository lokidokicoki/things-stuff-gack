var LDC = LDC || {};

LDC.Thing = function (id,x,y) {
	this.id = id;
	this.age = 0;
	this.energy = 300;
	this.speed = 1;
	this.eaten = false;
	this.position = [x,y];
};

LDC.ThingManager = (function () {
	var self = null;
	var scale = 1;
	var grid = null; // where all the 'thing' instances live
	var rad360 = Math.PI * 2;
	var counter = 0;

	function move(thing, x,y, dish) {
		var nx = x + (tsg.utils.getRandomInt(0,thing.speed) *  tsg.utils.plusOrMinus());
		var ny = y + (tsg.utils.getRandomInt(0,thing.speed) *  tsg.utils.plusOrMinus());
		
		dish[nx][ny] = thing;
		thing.position =[nx,ny]
		thing.energy -= thing.speed;
	};

	function spawn (x,y,dish) {
		var nx = x + (tsg.utils.getRandomInt(0,1) *  tsg.utils.plusOrMinus());
		var ny = y + (tsg.utils.getRandomInt(0,1) *  tsg.utils.plusOrMinus());
		//console.debug(x, y, nx,ny);
		if (nx < 0 || ny < 0 || nx >= tsg.xlen || ny >= tsg.ylen){
			return false;
		}
		
		dish[nx][ny] = new LDC.Thing(counter++, nx, ny);
	};

	// initial populate of grid
	function populate () {
		grid = tsg.utils.makeGrid(tsg.xlen, tsg.ylen);

		for (var y = 0; y < tsg.ylen; y++){
			for (var x = 0; x < tsg.xlen; x++){
				var val = tsg.utils.getRandomInt(0,2000);
				if (val === 5){
					grid[x][y] = new LDC.Thing(counter++, x,y);
				}
			}
		}
		//grid[25][25] = new LDC.Thing();
	};

	return {
		init : function (cellWidth) {
			self = this;
			scale = cellWidth;
			populate();	
		},

		incubate : function () {
			var next = tsg.utils.makeGrid(tsg.xlen, tsg.ylen);

			for (var x = 0; x < tsg.xlen; x++){
				for (var y = 0; y < tsg.ylen; y++){
					var thing = grid[x][y];
					if (thing && thing !== undefined){
						// born
						if (thing.age%15 == 0) {
							//spawn(x,y, next);
							//console.debug('thing.spawn');
						}

						thing.eaten = false;
						// eat
						if (tsg.stuffMgr.hasStuff(x,y)){
							next[x][y] = thing;
							thing.energy+=3;
							thing.eaten = true;
							tsg.stuffMgr.killStuff(x,y);
						}else{
							move(thing, x,y, next);
						}

						// shag
						thing.age++;
						
						// die
						if (thing.energy < 0) {
							delete thing;
							next[x][y]=null;
						}
					}
				}
			}

			grid = next;
		},

		hasThing : function (x,y) {
			var thing = grid[x][y];
			if (thing && thing !== undefined){
				return thing;
			}else{
				return null;
			}
		},

		draw : function (ctx, x,y) {
			var thing = grid[x][y];
			if (thing && thing !== undefined){
				ctx.beginPath();
				var fill='';
				var energy = thing.energy;
				if (energy > 200) {
					ctx.fillStyle = "rgb(255,0,0)";
				}else if (energy > 100) { 
					ctx.fillStyle = "rgb(128,0,0)";
				}else{
					ctx.fillStyle = "rgb(64,0,0)";
				}
				ctx.arc(x*scale,y*scale, 1*scale, 0, rad360);
				ctx.fill();
			}
			return ctx;
		}
	}
});
