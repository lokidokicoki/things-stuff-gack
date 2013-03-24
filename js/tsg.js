"use strict";

var LDC = LDC || {};

LDC.Application = (function () {
	var ctx = null;
	var canvas = null;
	var self = null;
	var generations = 0;
	var running = true;
	var tolerance = 2;

	var cellWidth = 1

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
				var xw = x*cellWidth;
				var yw = y*cellWidth;
				ctx.fillRect (xw, yw, cellWidth, cellWidth);
				//ctx = tsg.thingMgr.draw(ctx, x,y);
				/*
				var cell = grid[x][y];
				if (cell === 1){
					ctx.fillStyle = "rgb("+r+","+g+","+b+")";
				}else{
					ctx.fillStyle = "rgb(0,0,0)";
				}
				*/
			}
		}
		//for (var x = 0; x < tsg.xlen; x++){
	//		for (var y = 0; y < tsg.ylen; y++){
				ctx = tsg.thingMgr.draw(ctx);
				/*
				var cell = grid[x][y];
				if (cell === 1){
					ctx.fillStyle = "rgb("+r+","+g+","+b+")";
				}else{
					ctx.fillStyle = "rgb(0,0,0)";
				}
				*/
	//		}
	//	}
		if (running){
			setTimeout(tsg.run, 50);
		}
	};

	return {
		utils : null,
		stuffMgr : null,
		xlen : 0,
		ylen : 0,

		pause : function () {
			running = !running;
			if (running) {
				$('#pause').button("option", "icons", { primary: "ui-icon-pause" });
				self.run();
			}else{
				$('#pause').button("option", "icons", { primary: "ui-icon-play" });
			}
		},
		save : function () {
			var resume = running;
			if (resume){
				self.pause();
			}
			var s = self.stuffMgr.serialize();
			var t = self.thingMgr.serialize();
			localStorage.setItem("ldc.tsg.stuff", s);
			localStorage.setItem("ldc.tsg.things", t);
			localStorage.setItem("ldc.tsg.generations", generations);
			if (resume){
				self.pause();
			}
		},
		load : function () {
			var resume = running;
			if (resume){
				self.pause();
			}
			var g = null;
			try{
				generations = parseInt(localStorage.getItem("ldc.tsg.generations"), 10);
				$('#generations').html(generations);
				g = localStorage.getItem("ldc.tsg.stuff");
				g = JSON.parse(g);
				self.stuffMgr.load(g);
				g = localStorage.getItem("ldc.tsg.things");
				g = JSON.parse(g);
				self.thingMgr.load(g);
				draw();
			}catch (e){
				console.debug(e);
			}
			if (resume){
				self.pause();
			}
		},
		run : function () {
			draw();

			tsg.stuffMgr.incubate();
			tsg.thingMgr.incubate();

			generations++;
			$('#generations').html(generations);
		},

		main : function (w,x,y) {
			self = this;
			$('#info').dialog({
				title: 'Thing Info',
				dialogClass: "no-close",
				autoOpen:false,
				resizable: false,
				buttons:[
					{
						text:'OK',
						click: function() {
          					$( this ).dialog( "close" );
        				}
					}
				]
			});

			cellWidth=w;
			$('#pause').button({text:false, icons: { primary: "ui-icon-pause" }}).click(function () {self.pause();});
			$('#save').button({text:false, icons: { primary: "ui-icon-gear" }}).click(function () {self.save();});
			$('#load').button({text:false, icons: { primary: "ui-icon-extlink" }}).click(function () {self.load();});
			if (Modernizr.localstorage) {
				// window.localStorage is available!
			} else {
				// no native support for HTML5 storage :(
				// maybe try dojox.storage or a third-party solution
			}
			self.utils = LDC.Utils();
			self.stuffMgr = LDC.StuffManager();
			self.thingMgr = LDC.ThingManager(cellWidth);
			canvas = document.getElementById('petri');
			ctx = canvas.getContext('2d');
			self.xlen = x;
			self.ylen = y;
			$('#petri').attr('width', w*x);
			$('#petri').attr('height', w*y);
			$('#petri').on('click', self.click);


			self.stuffMgr.init();
			self.thingMgr.init(cellWidth);

			draw();
		},


		info : function (thing) {
				$('#info-uid').html(thing.uid);
				$('#info-energy').html(thing.energy);
				$('#info-position').html(thing.position[0]+','+thing.position[1]);
		},
		click : function (e) {
			//var x = (e.pageX - $('#petri').offsetLeft)/cellWidth;
			//var y = (e.pageY - $('#petri').offsetTop)/cellWidth;
			var x = e.offsetX / cellWidth;
			var y = e.offsetY / cellWidth;
			$('#clicked').text(x+','+y);

			var nearest = self.thingMgr.nearest([x,y]);
			if (nearest && nearest[1] < tolerance*cellWidth){
				var thing = nearest[0];
				thing.selected = true;
				self.info(thing);
				$('#info').dialog('open');
			}
		}
	};
});

var tsg = LDC.Application();
