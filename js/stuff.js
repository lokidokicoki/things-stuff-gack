var LDC = LDC || {};

LDC.Stuff = (function () {
	var self = null;

	function populate (grid) {
		for (var y = 0; y < tsg.ylen; y++){
			for (var x = 0; x < tsg.xlen; x++){
				var val = tsg.utils.getRandomInt(0,200);
				if (val === 5){
					grid[x][y] = 1;
				}
			}
		}
	};

	return {
		init : function (grid) {
			self = this;
			populate(grid);
		}
	};
});
