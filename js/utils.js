var LDC = LDC || {};

LDC.Utils = (function () {
	var self = null;

	return {
		makeGrid : function (x,y) {
			// make grid
			var grid = [];
			for (var i = 0; i < x; i++) {
				grid[i] = [];
				for (var j = 0; j < y; j++) {
					grid[i][j] = null;//0;//getRandomInt(0,1);
				}
			}
			return grid;
		},

		/**
		 * Apparently cheaper than pow
		 */
		sqr : function (v) {
			return v*v;
		},

		getRandomInt : function (min, max) {
		  return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		plusOrMinus : function() {
			var r =  Math.random() < 0.5 ? -1 : 1;
//			console.debug(r);
			return r;
		}
	};
});
