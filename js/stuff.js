var LDC = LDC || {};

LDC.Stuff = function () {
	this.age = 0;
//	this.position = [0,0];
};

LDC.StuffManager = (function () {
	var self = null;
	var grid = null; // where all the 'stuff' instances live

	function check(x,y){
		var count = 0;
		if (tsg.stuffMgr.hasStuff([x-1,y-1])) {count++}
		if (tsg.stuffMgr.hasStuff([x,y-1])) {count++}
		if (tsg.stuffMgr.hasStuff([x+1,y-1])) {count++}
		if (tsg.stuffMgr.hasStuff([x-1,y])) {count++}
		if (tsg.stuffMgr.hasStuff([x+1,y])) {count++}
		if (tsg.stuffMgr.hasStuff([x-1,y+1])) {count++}
		if (tsg.stuffMgr.hasStuff([x,y+1])) {count++}
		if (tsg.stuffMgr.hasStuff([x+1,y+1])) {count++}
		if (count > 6){
			return true;
		}else{
			return false;
		}

	};
	function spawn (x,y,dish, attempt) {
		var nx = x + (tsg.utils.getRandomInt(0,1) *  tsg.utils.plusOrMinus());
		var ny = y + (tsg.utils.getRandomInt(0,1) *  tsg.utils.plusOrMinus());
		//console.debug(x, y, nx,ny);
		if (nx < 0 || ny < 0 || nx >= tsg.xlen || ny >= tsg.ylen){
			return false;
		}
		if (tsg.stuffMgr.hasStuff([nx,ny])){
			return false;
		}
		
		dish[nx][ny] = new LDC.Stuff();
	};

	// initial populate of grid
	function populate () {
		grid = tsg.utils.makeGrid(tsg.xlen, tsg.ylen);

		for (var y = 0; y < tsg.ylen; y++){
			for (var x = 0; x < tsg.xlen; x++){
				var val = tsg.utils.getRandomInt(0,1000);
				if (val === 5){
					grid[x][y] = new LDC.Stuff();
				}
			}
		}
					//grid[25][25] = new LDC.Stuff();
	};

	return {
		init : function () {
			self = this;
			populate();
		},
		serialize : function () {
			return JSON.stringify(grid);
		},
		load : function (g) {
			grid = g;
		},
		hasStuff : function (point) {
			var x = point[0]; var y = point[1];
			if (x < 0 || y < 0 || x >= tsg.xlen || y >= tsg.ylen){
				return false;
			}
			var s = null;
			try{
				s = grid[x][y];
			}catch (e){
				console.log(e);
				console.debug(x,y);
			}
			return s;
		},
		killStuff : function (point){
			var x = point[0]; var y = point[1];
			var stuff = grid[x][y];
			delete stuff;
			grid[x][y] = null;
		},

		add : function (dish, x,y) {
			if (x < 0 || y < 0 || x >= tsg.xlen || y >= tsg.ylen){
				return false;
			}
			dish[x][y] = new LDC.Stuff();
		},

		incubate : function () {
			var next = tsg.utils.makeGrid(tsg.xlen, tsg.ylen);

			for (var x = 0; x < tsg.xlen; x++){
				for (var y = 0; y < tsg.ylen; y++){
					var stuff = grid[x][y];
					if (stuff && stuff !== undefined){
						next[x][y] = stuff;
						if (stuff.age%20 == 0) {
							spawn(x,y, next);
						}
						if (check(x,y)){
							stuff.age=999;
						}
						stuff.age++;
						
						if (stuff.age >= 100) {
							delete stuff;
							next[x][y]=null;
						}
					}
				}
			}

			grid = next;
		},
		draw : function (ctx, x,y) {
			var stuff = grid[x][y];
			if (stuff && stuff !== undefined){
				var age = stuff.age;
				if (age <= 30) {
					ctx.fillStyle = "rgb(0,255,0)";
				}else if (age <=60) { 
					ctx.fillStyle = "rgb(0,128,0)";
				}else{
					ctx.fillStyle = "rgb(0,64,0)";
				}
			}
			return ctx;
		}
	};
});
