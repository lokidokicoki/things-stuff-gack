"use strict";

var LDC = LDC || {};

LDC.Application = (function () {
	var ctx = null;
	var canvas = null;
	var self = null;
	var ticks = 0;
	var running = true;
	var tolerance = 2;
	var cellWidth = 1

	/**
 	 * Wrapper call aournd internal draw functions
	 */
	function draw () {
		// loop over grid and draw Stuffs
		for (var x = 0; x < tsg.xlen; x++){
			for (var y = 0; y < tsg.ylen; y++){
				// clear cell
				ctx.fillStyle = "rgb(0,0,0)";

				ctx = tsg.stuffMgr.draw(ctx, x,y);
				var xw = x*cellWidth;
				var yw = y*cellWidth;
				ctx.fillRect (xw, yw, cellWidth, cellWidth);
			}
		}

		// draw the Things
		ctx = tsg.thingMgr.draw(ctx);

		if (running){
			setTimeout(tsg.run, 50);
		}
	};

	return {
		utils : null,
		stuffMgr : null,
		xlen : 0,
		ylen : 0,

		/**
		 * pause/.play the action
		 */
		pause : function () {
			running = !running;
			if (running) {
				$('#pause').button("option", "icons", { primary: "ui-icon-pause" });
				self.run();
			}else{
				$('#pause').button("option", "icons", { primary: "ui-icon-play" });
			}
		},

		/**
		 * Save data to local storage
		 */
		save : function () {
			var resume = running;
			if (resume){
				self.pause();
			}
			var s = self.stuffMgr.save();
			var t = self.thingMgr.save();
			localStorage.setItem("ldc.tsg.stuff", s);
			localStorage.setItem("ldc.tsg.things", t);
			localStorage.setItem("ldc.tsg.ticks", ticks);
			if (resume){
				self.pause();
			}
		},

		/**
		 * Load data from storage
		 */
		load : function () {
			var resume = running;
			if (resume){
				self.pause();
			}
			var g = null;
			try{
				ticks = parseInt(localStorage.getItem("ldc.tsg.ticks"), 10);
				$('#ticks').html(ticks);
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

		/**
		 * Run the simulation.
		 */
		run : function () {
			draw();

			tsg.stuffMgr.incubate();
			tsg.thingMgr.incubate();

			ticks++;
			$('#ticks').html(ticks);
		},

		getTicks : function () {
			return ticks;
		},

		/**
		 * @param cw cell width
		 * @param w width of dish
		 * @param h height of dish
		 */
		main : function (cw,w,h) {
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
			cellWidth=cw;
			self.xlen = w;
			self.ylen = h;
			$('#petri').attr('width', cw*w);
			$('#petri').attr('height', cw*h);
			$('#petri').on('click', self.click);

			self.stuffMgr.init();
			self.utils.init();
			self.thingMgr.init(cellWidth);

			draw();
		},

		/**
		 * update info panel
		 */
		info : function (thing) {
			$('#info-uid').html(thing.uid);
			$('#info-energy').html(thing.energy);
			$('#info-position').html(thing.position[0]+','+thing.position[1]);
			$('#info-direction').html(thing.direction);
			$('#info-nofood').html(thing.noFood);
			$('#info-speed').html(thing.traits.speed);
			$('#info-tumble').html(thing.traits.tumble);
			$('#info-hunt').html(thing.traits.hunt);
			$('#info-efficiency').html(thing.traits.efficiency);
			$('#info-ancestry').html(thing.ancestry);
		},

		/**
		 * Click handler. 
		 * Find nearest thing, open info panel
		 */
		click : function (e) {
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
