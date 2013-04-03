var LDC = LDC || {};

LDC.Thing = function (uid,x,y) {
	this.uid = 'T'+uid;
	this.age = 0;
	this.energy = 300;
	this.eaten = false;
	this.position = [x,y];
	this.selected = false;
	// expression of genes, choose highest value (dominant)
	this.traits = {speed:1, tumble:10, hunt:30, efficiency:1};
	this.direction = 0;
	this.noFood = 0;
	this.ancestry = '';
	this.kid = true;
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
	function tumble(thing) {
		var nx = thing.position[0] + (tsg.utils.getRandomInt(0,thing.traits.speed) *  tsg.utils.plusOrMinus());
		var ny = thing.position[1] + (tsg.utils.getRandomInt(0,thing.traits.speed) *  tsg.utils.plusOrMinus());
		
		if (nx >= 0 || ny >= 0 || nx < tsg.xlen || ny < tsg.ylen){
			thing.position = [nx,ny];
		}
		thing.energy -= thing.traits.speed;
		thing.direction = 0;
	};

	/**
	 * thing movement
	 */
	function hunt(thing) {
		// pick a direction, stay on this course until food or wall.
		if (thing.direction == 0){
			thing.direction = tsg.utils.getRandomInt(1,8);
		}

		var x = 0;
		var y = 0;
		switch (thing.direction){
			case 1:
				x=1;
				break;
			case 2:
				x=1;
				y=1;
				break;
			case 3:
				y=1;
				break;
			case 4:
				x=-1;
				y=1;
				break;
			case 5:
				x=-1;
				break;
			case 6:
				x=-1;
				y=-1;
				break;
			case 7:
				y=-1;
				break;
			case 8:
				x=1;
				y=-1;
				break;
			default:
				break;
		}

		var nx = thing.position[0] + x;
		var ny = thing.position[1] + y;
		if (nx >= 0 || ny >= 0 || nx < tsg.xlen || ny < tsg.ylen){
			thing.position = [nx,ny];
		}else{
			thing.direction = 0;
		}
		thing.energy -= thing.traits.speed;
	};

	/**
	 * Prototype spawn function
	 */
	function spawn (ancestor) {
		var nx = ancestor.position[0];
		var ny = ancestor.position[1];
		ancestor.energy -= 100;
		var thing = new LDC.Thing(counter++, nx, ny);
		thing.ancestry = ancestor.ancestry + 'S'+ ancestor.uid
		thing.energy = 100;
		for (var t in ancestor.traits){
			thing.traits[t] = ancestor.traits[t];
		}
		store[thing.uid] = thing;
	};
	
	function breed (mum, dad){
		if (mum.energy > 100 && dad.energy > 100) {
			console.debug('breed: mum:'+mum.uid+':'+mum.position+', dad:'+dad.uid+':'+dad.position);
			var genes = {}
			for (var trait in mum.traits){
				if (tsg.utils.coinFlip() == 1){
					genes[trait] = mum.traits[trait];
				}else{
					genes[trait] = dad.traits[trait];
				}
			}

			var nx = mum.position[0];
			var ny = mum.position[1];
			var thing = new LDC.Thing(counter++, nx, ny);
			store[thing.uid] = thing;
			thing.ancestry = 'M' + mum.uid + 'D' + dad.uid;
			thing.traits = genes;
			thing.child = true;
			thing.energy = 100;
			mum.energy -= 100;
			dad.energy -= 100;
		}
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
					for (var trait in thing.traits){
						var kicker = (tsg.utils.getRandomInt(0,200))/100;
						var value = thing.traits[trait] * kicker;
						thing.traits[trait] = value;
					}

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
					var nearest = self.nearest(thing.position, thing);
					if (nearest[1] < 2){
						breed(thing, nearest[0]);
					}else{
						// this is asexual reproduction
						if (thing.energy > 50 && (thing.age+1)%100==0) {
							spawn(thing);
						}
					}

					// eat
					thing.eaten = false;
					if (tsg.stuffMgr.hasStuff(thing.position)){
						thing.energy += (5 * thing.traits.efficiency);
						thing.eaten = true;
						thing.noFood = 0;
						tsg.stuffMgr.killStuff(thing.position);
					}else{
						thing.noFood++;
						if (thing.noFood < thing.traits.tumble){
							tumble(thing);
						} else if (thing.noFood < thing.traits.hunt) {
							hunt(thing);
						} else {
							thing.noFood=0;
						}
					}

					// shag
					thing.age++;
					if (thing.age > 15){
						thing.kid=false;
					}
					
					// die
					if (thing.energy < 0) {
						delete store[thing.uid];
						delete thing;
					}
				}
			}
		},

		/**
		 * Find the Thing nearest to the passed point.
		 * Also, 'deselects' the things.
		 * @param point [x,y]
		 * @result array containing [Thing, distance]
		 */
		nearest : function (point, exclude) {
			var minima = 99999999;
			var result = null;
			for (var uid in store){
				var thing = store[uid];
				if (exclude && exclude !== undefined && exclude.uid == thing.uid){
					continue;
				}
				if (thing && thing !== undefined){
					if (exclude == undefined){
						thing.selected = false;
					}
					var x2 = Math.abs(point[0] - thing.position[0]);
					var y2 = Math.abs(point[1] - thing.position[1]);
					var dist = Math.sqrt(tsg.utils.sqr(x2) + tsg.utils.sqr(y2));
					if (dist < minima) {
						minima = dist;
						result = [thing, dist];	
					}
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
					var kid = 0;
					if (thing.selected){
						select = 255;
						tsg.info(thing);
					}
					if (thing.kid){
						kid = 255
					}
					ctx.beginPath();
					var fill='';
					var energy = thing.energy;
					if (energy > 200) {
						ctx.fillStyle = "rgb(255,"+kid+","+select+")";
					}else if (energy > 100) { 
						ctx.fillStyle = "rgb(128,"+kid+","+select+")";
					}else{
						ctx.fillStyle = "rgb(64,"+kid+","+select+")";
					}
					ctx.arc(thing.position[0]*scale,thing.position[1]*scale, 1.5*scale, 0, rad360);
					ctx.fill();
				}
			}
			return ctx;
		}
	}
});
