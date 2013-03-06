"use strict";

var LDC = LDC || {};

LDC.Application = (function () {
	var ctx = null;
	var canvas = null;
	var self = null;
	var generations = 0;

	var cellWidth = 1

	function run () {
		draw();

		tsg.stuffMgr.incubate();

		generations++;
	};

	function incubate () {
	};
	function draw () {
		var r = 200;//getRandomInt(0, 255);
		var g = 0;//getRandomInt(0, 255);
		var b = 0;//getRandomInt(0, 255);

		for (var x = 0; x < tsg.xlen; x++){
			for (var y = 0; y < tsg.ylen; y++){
				// clear cell
				ctx.fillStyle = "rgb(0,0,0)";

				ctx = tsg.stuffMgr.draw(ctx, x,y);
				/*
				var cell = grid[x][y];
				if (cell === 1){
					ctx.fillStyle = "rgb("+r+","+g+","+b+")";
				}else{
					ctx.fillStyle = "rgb(0,0,0)";
				}
				*/
				var xw = x*cellWidth;
				var yw = y*cellWidth;
				ctx.fillRect (xw, yw, cellWidth, cellWidth);
			}
		}
		setTimeout(run, 50);
	};

	return {
		utils : null,
		stuffMgr : null,
		xlen : 0,
		ylen : 0,

		main : function (w,x,y) {
			self = this;
			self.utils = LDC.Utils();
			self.stuffMgr = LDC.StuffManager();
			canvas = document.getElementById('petri');
			ctx = canvas.getContext('2d');
			self.xlen = x;
			self.ylen = y;
			$('#petri').attr('width', w*x);
			$('#petri').attr('height', w*y);

			cellWidth=w;

			//makeGrid(self.xlen,self.ylen);

			self.stuffMgr.init();

			draw();
		}
	};
});

var tsg = LDC.Application();
