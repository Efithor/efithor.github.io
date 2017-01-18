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
	var walls = [];
	
	//Methods

	//Generate maze method. 
		//Procedurally generates the maze to prevent any sections from
		//being walled off, and that there is one entrance and exit. It modefies the segments and
		//walls arrays that are used by the object to be an array of booleans, which are then
		//used by the draw maze function.
	
		//Segment guide: 
		//0-7 are inner circle
		//8-23 are mid circle
		//24-55 are outer circle
	
		//Wall guide:
		//0-7 are inner walls
		//8-23 are outer walls
	maze.prototype.generateMaze = function(){
		for (i=0;i<56;i++){
			if (Math.random() > 0.35){
				segments[i] = true;
			}else{
				segments[i] = false;
			}
		}
		for (i=0;i<24;i++){
			if (Math.random() > 0.35){
				walls[i] = true;
			}else{
				walls[i] = false;
			}
		}
	}
	
	//The draw maze method. Takes variables from the design maze function and draws the maze.
	//For now it just draws all the components of the maze. The parts of the maze are globally
	//accessible to allow for collision detection.
	maze.prototype.drawMaze = function(coreX,coreY, ringNum, ringThickness, ringSep){
		//Draw the core. The core never changes, so it doesn't have its own method.
		Core = new paper.Path.Circle(new paper.Point(coreX, coreY), 20);
		Core.fillColor = 'black';
		
		//Draw the appropriate number of rings given a ring number.
		var currentRing = 0;
		
		for (i=0;i < 8; i++){
			if (segments[i] == true){
				segments[i] = this.drawSegment(ringSep,0,ringThickness);
				segments[i].rotate(i*45,paper.view.center);
			}
		}
		for (i=8;i < 24; i++){
			if (segments[i] == true){
				segments[i] = this.drawSegment(ringSep*2,1,ringThickness);
				segments[i].rotate(i*22.5,paper.view.center);
			}
		}
		for (i=24;i < 56; i++){
			if (segments[i] == true){
				segments[i] = this.drawSegment(ringSep*3,2,ringThickness);
				segments[i].rotate(i*11.25,paper.view.center);
			}
		}
		
		//Draw walls 
		for (i=0; i<8; i++){
			if (walls[i]== true){
				walls[i] = this.drawWall(0,10,ringSep, ringThickness);
				walls[i].rotate(i*45,paper.view.center);
			}
		}
		for (i=8; i<24; i++){
			if (walls[i] == true){
				walls[i] = this.drawWall(1,10,ringSep, ringThickness);
				walls[i].rotate(i*22.5,paper.view.center);
			}
		}
	}
	//Draws a basic segment. Can currently only draw rings 0, 1, and 2.
	maze.prototype.drawSegment = function(radius, ringNum, thickness){
		//Determine angles of segments
		var frmAng = Math.PI/2;
 
		if (ringNum == 0){
			var throughAng = (3*Math.PI)/8;
			var toAng = Math.PI/4;
		}
		if (ringNum == 1){
			var throughAng = 0.4375*Math.PI;
			var toAng = (3*Math.PI)/8;
		}
		if (ringNum == 2){
			var throughAng = 0.468*Math.PI;
			var toAng = 0.4375*Math.PI;
		}
		
		//Detemine points for segments
		var frm = new paper.Point(paper.view.center.x+(radius*Math.cos(frmAng)), paper.view.center.y+(radius*Math.sin(frmAng)));
		var through = new paper.Point(paper.view.center.x+(radius*Math.cos(throughAng)), paper.view.center.y+(radius*Math.sin(throughAng)));
		var to = new paper.Point(paper.view.center.x+(radius*Math.cos(toAng)),paper.view.center.y+(radius*Math.sin(toAng)));

		var frm2 = new paper.Point(paper.view.center.x+((radius+thickness)*Math.cos(frmAng)), paper.view.center.y+((radius+thickness)*Math.sin(frmAng)));
		var through2 = new paper.Point(paper.view.center.x+((radius+thickness)*Math.cos(throughAng)), paper.view.center.y+((radius+thickness)*Math.sin(throughAng)));
		var to2 = new paper.Point(paper.view.center.x+((radius+thickness)*Math.cos(toAng)), paper.view.center.y+((radius+thickness)*Math.sin(toAng)));

		var arc1 = new paper.Path.Arc(frm, through, to);
		var arc2 = new paper.Path.Arc(to2, through2, frm2);

		arc1.join(arc2);
		arc1.add([frm2],[frm]);
		
		arc1.fillColor = 'black';
		arc1.strokeColor = 'black';
		arc1.selected = true;
		arc1.closed = true;
		
		return arc1;
		
	}
	
	//Draw wall method (Ring number, thickness of wall, seperation of rings, thickness of rings)
	
	maze.prototype.drawWall = function(ringNum, thickness,ringSep, ringThickness){
		var rect = new paper.Rectangle(paper.view.center.x,paper.view.center.y+ringSep+(ringSep*ringNum)+(ringThickness/2),thickness,ringSep);
		var rectPath = new paper.Path.Rectangle(rect);
		rectPath.fillColor = 'black';
		rectPath.strokeColor = 'black';
		rectPath.selected = true;
		
		return rectPath;
	}
	//Rotate maze method. Goes through each part of the segments and wall arrays and if the spot is not blank,
	//rotates the path.
	maze.prototype.rotateMaze = function(speed){
		for(i=0; i<56; i++){
			if(segments[i] != false){	
				segments[i].rotate(speed, paper.view.center);
			}
		}
		for(i=0; i<24; i++){
			if(walls[i] != false){	
				walls[i].rotate(speed, paper.view.center);
			}
		}
	}
};

//Define maze object methods

window.onload = function(){
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);
	
	theMaze = new maze();
	theMaze.generateMaze();
	theMaze.drawMaze(paper.view.center.x,paper.view.center.y,2,20,64);
	
	paper.view.onFrame = function(event){
		theMaze.rotateMaze(0.2);
		paper.view.update();
	}
	
	
}


//Run physics
//Apply gravity, but reset position whenever a collision occurs. 