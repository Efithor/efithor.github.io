//The central element for the Node Orange webpage. 
//Involves a circular maze that constantly rotates, and is thus navigated
//by a ball. The maze is procedurally generated. 

//Generate maze
//The maze is four concentric rings with holes in rings 2 and 3 and walls in between 1, 2, 
//and 3. 


//Draw maze and ball
//Draw Core

//Define maze object
var maze = function(){
	//Variables
	var segments = [];
	
	//Methods
	maze.prototype.testFunction = function(){
		var Path = new paper.Path.Circle(new paper.Point(300,325),20);
		Path.fillColor = 'black';
		paper.view.update();
	}
	//Generate maze method. Procedurally generates the maze to prevent any sections from
	//being walled off, and that there is one entrance and exit. Then passes this info to
	//the draw maze method in the form of an array of ones and zeros.
	maze.prototype.generateMaze = function(){
		
	}
	//The draw maze method. Takes variables from the design maze function and draws the maze.
	//For now it just draws all the components of the maze. The parts of the maze are globally
	//accessible to allow for collision detection.
	maze.prototype.drawMaze = function(coreX,coreY, ringNum){
		//Draw the core. The core never changes, so it doesn't have its own method.
		Core = new paper.Path.Circle(new paper.Point(coreX, coreY), 20);
		Core.fillColor = 'black';
		
		//Draw the appropriate number of rings given a ring number.
		var currentRing = 0;
		
		for (i=0;i < 8; i++){
			segments[i] = this.drawSegment(64,0);
			segments[i].rotate(i*45,paper.view.center);
		}
		//for (i=0;i < 16; i++){
		//	segments[i] = this.drawSegment(128,1);
		//	segments[i].translate(new paper.Point(0,64));
		//	segments[i].rotate(i*22.5,paper.view.center);
		//}
		
		paper.view.update();
	}
	//Draws a basic segment. Currently only draws segments that work for the inner ring. 
	//Next iteration should take a ring number and return a proper segment.
	maze.prototype.drawSegment = function(radius, ringNum){
		//Determine angles of segments
		if (ringNum == 0){
			var frmAng = Math.PI/2;
			var throughAng = (3*Math.PI)/8;
			var toAng = Math.PI/4;
		}
		if (ringNum == 1){
			var frmAng = Math.PI/2;
			var throughAng = 0.6875*Math.PI;
			var toAng = (3*Math.PI)/8;
		}
		
		//Detemine points for segments
		var frm = new paper.Point(paper.view.center.x+(radius*Math.cos(Math.PI/2)), paper.view.center.y+(radius*Math.sin(Math.PI/2)));
		var through = new paper.Point(paper.view.center.x+(radius*Math.cos((3*Math.PI)/8)), paper.view.center.y+(radius*Math.sin((3*Math.PI)/8))));
		var to = new paper.Point(paper.view.center.x+(radius*Math.cos(Math.PI/4)),paper.view.center.y+(radius*Math.sin(Math.PI/4)));

		var frm2 = new paper.Point(paper.view.center.x+((radius+10)*Math.cos(Math.PI/2)), paper.view.center.y+((radius+10)*Math.sin(Math.PI/2)));
		var through2 = new paper.Point(paper.view.center.x+((radius+10)*Math.cos((3*Math.PI)/8)), paper.view.center.y+((radius+10)*Math.sin((3*Math.PI)/8))));
		var to2 = new paper.Point(paper.view.center.x+((radius+10)*Math.cos(Math.PI/4)), paper.view.center.y+((radius+10)*Math.sin(Math.PI/4)));

		var arc1 = new paper.Path.Arc(frm, through, to);
		var arc2 = new paper.Path.Arc(to2, through2, frm2);

		arc1.join(arc2);
		arc1.add([frm2],[frm]);
		
		arc1.fillColor = 'black';
		arc1.selected = true;
		arc1.closed = true;
		
		return arc1;
		
	}
	
	//Rotate maze method.
	maze.prototype.rotateMaze = function(){
		
	}
};

//Define maze object methods

window.onload = function(){
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);
	
	theMaze = new maze();
	theMaze.drawMaze(paper.view.center.x,paper.view.center.y,3);
	
	paper.view.update();
	
}


//Run physics
//Apply gravity, but reset position whenever a collision occurs. 