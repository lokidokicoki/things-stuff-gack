var LDC = LDC || {};

LDC.Utils = (function () {
	var self = null;

	return {
		getRandomInt : function (min, max) {
		  return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	};
});
