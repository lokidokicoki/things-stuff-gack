var LDC = LDC || {};

LDC.Thing = function (uid,x,y) {
	this.uid = 'T'+uid;
	this.age = 0;
	this.energy = 300;
	this.speed = 1;
	this.eaten = false;
	this.position = [x,y];
	this.selected = false;
	// expression of genes, choose highest value (dominant)
	this.traits = {speed:1, tumble:1, efficiency:1};
	this.genes = [{speed:0, tumble:0, efficiency:0}, {speed:0, tumble:0, efficiency:0}];
	this.noFood = 0;
};

LDC.ThingManager = (function () {
	var self = null;
	var scale = 1;
	var rad360 = Math.PI * 2;
	var counter = 0;
	var store = {}; //where all thing instance live

	/**
	 * thing movement
	 */
	function move(thing) {
		var x = thing.position[0] + (tsg.utils.getRandomInt(0,thing.speed) *  tsg.utils.plusOrMinus());
		var y = thing.position[1] + (tsg.utils.getRandomInt(0,thing.speed) *  tsg.utils.plusOrMinus());
		
		thing.position =[x,y]
		thing.energy -= thing.speed;
	};

	/**
	 * Prototype spawn function
	 */
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

	/**
	 * initial populating of grid
	 */
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
		/**
		 * Initialise thing manager
		 * calls populate
		 */
		init : function (cellWidth) {
			self = this;
			scale = cellWidth;
			populate();	
		},

		/**
		 * Stringify store
		 * @return string data
		 */
		save : function () {
			return JSON.stringify(store);
		},

		/**
		 * Set store data external source
		 * @param data new thing store
		 */
		load : function (data) {
			store = data;
		},

		/**
		 * Incubate the Things.
		 * Each thing gets to do the following:
		 * - eat or find food
		 * - shag another Thing
		 * - die
		 */
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

		/**
		 * Find the Thing nearest to the passed point.
		 * Also, 'deselects' the things.
		 * @param point [x,y]
		 * @result array containing [Tihng, distance]
		 */
		nearest : function (point) {
			var minima = 99999999;
			var result = null;
			for (var uid in store){
				var thing = store[uid];
				thing.selected = false;
				var x2 = Math.abs(point[0] - thing.position[0]);
				var y2 = Math.abs(point[1] - thing.position[1]);
				var dist = Math.sqrt(tsg.utils.sqr(x2) + tsg.utils.sqr(y2));
				if (dist < minima) {
					minima = dist;
					result = [thing, dist];	
				}
			}

			return result;
		},

		/**
		 * Draw the things
		 */
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
						ctx.fillStyle = "rgb(255,"+select+","+select+")";
					}else if (energy > 100) { 
						ctx.fillStyle = "rgb(128,"+select+","+select+")";
					}else{
						ctx.fillStyle = "rgb(64,"+select+","+select+")";
					}
					ctx.arc(thing.position[0]*scale,thing.position[1]*scale, 2*scale, 0, rad360);
					ctx.fill();
				}
			}
			return ctx;
		}
	}
});
