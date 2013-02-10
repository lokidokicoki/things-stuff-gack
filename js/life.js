var ctx = null;
var canvas = null;
var self = null;

var front = null;
var back = null;
var cellWidth = 1
var useFront = true;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function makeGrid (x,y) {
	// make grid
	front = [];
	back = [];
  	for (var i = 0; i < x; i++) {
    	front[i] = [];
    	back[i] = [];
  		for (var j = 0; j < y; j++) {
			front[i][j] = getRandomInt(0,1);
			back[i][j] = front[i][j];//getRandomInt(0,1);
		}
  	}
}

function blink(){
	front[2][1]=1;
	front[2][2]=1;
	front[2][3]=1;

}

function main (w,x,y) {
	self = this;
	canvas = document.getElementById('petri');
	ctx = canvas.getContext('2d');
	$('#petri').attr('width', w*x);
	$('#petri').attr('height', w*y);
	cellWidth=w;

	makeGrid(x,y);

	//blink();

	draw();
};

function rules (cell, count){
	if (cell === 1){
		// cell is alive
		if (count < 2 || count > 3){
			cell = 0
		}
	}else{
		if (count === 3){
			cell = 1;
		}
	}
	return cell;
};

function run () {
	var xlen = front.length;
	var ylen = front[0].length;
	
	var grid = null;
	var newGrid = null;
	if (useFront){
		grid = front;
		newGrid = back;
	}else{
		grid = back;
		newGrid = front;
	}

	for (var y = 0; y < ylen; y++){
		for (var x = 0; x < xlen; x++){
			var cell = grid[x][y];

			//count living neightbours
			var px = x+1;
			var py = y+1;
			var nx = x-1;
			var ny = y-1;
			var count = 0;

			if (px < xlen && py < ylen && nx >= 0 && ny >=0){
				count += grid[px][py];
				count += grid[px][y];
				count += grid[px][ny];
				count += grid[x][ny];
				count += grid[nx][ny];
				count += grid[nx][y];
				count += grid[nx][py];
				count += grid[x][py];
			}

			newGrid[x][y] = rules(cell, count);
		}
	}

	useFront = !useFront;


	draw();
};

function draw () {
	var r = 200;//getRandomInt(0, 255);
	var g = 0;//getRandomInt(0, 255);
	var b = 0;//getRandomInt(0, 255);

	var grid = null;
	if (useFront){
		grid = front;
	}else{
		grid = back;
	}
	var xlen = grid.length;
	var ylen = grid[0].length;


	for (var x = 0; x < xlen; x++){
		for (var y = 0; y < ylen; y++){
			var cell = grid[x][y];
			if (cell === 1){
				ctx.fillStyle = "rgb("+r+","+g+","+b+")";
			}else{
				ctx.fillStyle = "rgb(0,0,0)";
			}
			var xw = x*cellWidth;
			var yw = y*cellWidth;
			ctx.fillRect (xw, yw, cellWidth, cellWidth);
		}
	}
	setTimeout(self.run, 50);
};


