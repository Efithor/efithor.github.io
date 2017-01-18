//The central element for the Node Orange webpage. 
//Involves a circular maze that constantly rotates, and is thus navigated
//by a ball. The maze is procedurally generated. 

//Generate maze
//The maze is four concentric rings with holes in rings 2 and 3 and walls in between 1, 2, 
//and 3. 


//Draw maze and ball
//Draw Core

//Define globals.
var mazeSpeed = 0.2;
var currRings = 1;
var maxRings = 4;
var minRings = 1;
var mazeColor = '#ffd633';
//var mazeGroup;
var UIGroup;
var segments = [];
var walls = [];
var mousePos = new paper.Point(0,0);
var mazeGroup;
var gameStart = false;
var enterZone;
var exitZone;
var enterSeg = [];
var exitSeg = [];
var enterSegGroup;
var exitSegGroup;
//var Core;

var testerArray = [];

//var selectorPath;

//Define maze object
var maze = function(){
	//Variables
	var checkedArray = [];
	var segChance = 0.75;
	var wallChance = 0.25;
	mazeGroup = new paper.Group();
	enterSegGroup = new paper.Group();
	exitSegGroup = new paper.Group();
	var Core;
	
	//Draws a basic segment. Can currently only draw rings 0, 1, and 2.
	maze.prototype.drawSegment = function(radius, ringNum, thickness){
		//Determine angles of segments
		var frmAng = Math.PI/2;
 
		var throughAng = ((Math.pow(2,ringNum+2)-1)/(8*(Math.pow(2,ringNum))))*Math.PI;
		
		var toAng = ((Math.pow(2,ringNum+1)-1)/(8*(Math.pow(2,ringNum-1))))*Math.PI;
		
		//Detemine points for segments
		var frm = new paper.Point(paper.view.center.x+(radius*Math.cos(frmAng)), paper.view.center.y+(radius*Math.sin(frmAng)));
		var through = new paper.Point(paper.view.center.x+(radius*Math.cos(throughAng)), paper.view.center.y+(radius*Math.sin(throughAng)));
		var to = new paper.Point(paper.view.center.x+(radius*Math.cos(toAng)),paper.view.center.y+(radius*Math.sin(toAng)));

		var frm2 = new paper.Point(paper.view.center.x+((radius+thickness)*Math.cos(frmAng)), paper.view.center.y+((radius+thickness)*Math.sin(frmAng)));
		var through2 = new paper.Point(paper.view.center.x+((radius+thickness)*Math.cos(throughAng)), paper.view.center.y+((radius+thickness)*Math.sin(throughAng)));
		var to2 = new paper.Point(paper.view.center.x+((radius+thickness)*Math.cos(toAng)), paper.view.center.y+((radius+thickness)*Math.sin(toAng)));

		var arc1 = new paper.Path.Arc(frm, through, to);

		var arc2 = new paper.Path.Arc(to2, through2, frm2);

		var side1 = new paper.Path((to.x,to.y),(to2.x,to2.y));
		
		var side2 = new paper.Path((frm.x,frm.y),(frm2.x,frm2.y));
		
		

		
		arc1.join(side2);
		arc1.join(side1);
		arc1.join(arc2);
		
		arc1.fillColor = mazeColor;
		arc1.strokeColor = mazeColor;
		arc1.selected = true;
		arc1.closed = true;
		
		mazeGroup.addChild(arc1);
		
		//arc1.rotate(180);
		return arc1;
		
	}
	
	
	
		
};

//Ball object. Ball is guided by the cursor. Dies if it touches the maze.

//Interface object. How the player alters the variables of the game.
var UI = function(){
	UIGroup = new paper.Group();
	var ringCounter;
	//Draw UI
	UI.prototype.drawUI = function(){
		upArrow = new paper.Path.RegularPolygon(new paper.Point(paper.view.center.x+460,paper.view.center.y-25),3,20);
		UIGroup.addChild(upArrow);
		downArrow = new paper.Path.RegularPolygon(new paper.Point(paper.view.center.x+460,paper.view.center.y+25),3,20);
		UIGroup.addChild(downArrow);
		downArrow.rotate(180);
		upArrow.fillColor = mazeColor;
		upArrow.strokeColor = mazeColor;
		downArrow.fillColor = mazeColor;
		downArrow.strokeColor = mazeColor;
		 
		ringCounter = new paper.PointText(new paper.Point(paper.view.center.x+380,paper.view.center.y+15));
		ringCounter.fillColor = mazeColor;
		ringCounter.strokeColor = mazeColor;
		ringCounter.scaling = 5;
		ringCounter.content = currRings+1;
	}
	 //Up arrow hover method. Whenever the mouse hovers over the up arrow and the ring number is not 5, outline the arrow in green.
	 //If the ring number is 5, outline the arrow in red.
	 
	 //Up arrow clicked method. Activate whenever the uparrow is clicked. 
	 //If clicked, generate a new maze and increase the number of rings by 1, unless the number of rings is 5, in which case flash red and do nothing.
	 UI.prototype.upArrowClicked = function(){
		 
		 
	 }
	
	UI.prototype.updateNum = function(){
		ringCounter.content = currRings+1;
	}
}
//Selector Function. Due to lag from onMouseEnter, hit testing will be used for
//UI elements instead.
var playerSphere = function(){
	var havePlayerSphere = false;
	var player;
	playerSphere.prototype.createPlayer = function(){
		player = new paper.Path.Circle(new paper.Point(0, 0), 5);
		player.fillColor = 'red';
		player.strokeColor = 'red';
	}
	playerSphere.prototype.pickupPlayerSphere = function(){
		havePlayerSphere = true;
	}
	playerSphere.prototype.movePlayer = function(mouseX,mouseY){
		if(havePlayerSphere==true){	
			player.position = new paper.Point(mouseX,mouseY);
		}
	}
	playerSphere.prototype.kill = function(){
		if(havePlayerSphere==true){
			console.log("CONNECTION FAILED");
			havePlayerSphere=false;
			gameStart = false;
			player.position=new paper.Point(50,50);
		}
	}	
	playerSphere.prototype.hasSphere = function(){
		return havePlayerSphere;
	}
	playerSphere.prototype.doesIntersect = function(){
		if(mazeGroup.contains(player.position)){
			return true;
		}
	}
	playerSphere.prototype.paint = function(){
		var paint = new paper.Path.Circle(new paper.Point(player.position),5);
		paint.fillColor = 'red';
	}
	
}

var connectionPort = function(){
	var port;
	connectionPort.prototype.drawPort = function(){
		port = new paper.Path.Circle(new paper.Point(50,50),20);
		port.fillColor = mazeColor;
		port.strokeColor = mazeColor;
	}
	connectionPort.prototype.checkPort = function(){
		if(port.contains(mousePos)){
			return true;
		}
	}
}

window.onload = function(){
	var tool = new paper.Tool();
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);
	
	theMaze = new maze();
	theMaze.drawSegment(64*3,2,20);
	
	theUI = new UI();
	theUI.drawUI();
	
	thePlayer = new playerSphere();
	thePlayer.createPlayer();
	
	thePort = new connectionPort();
	thePort.drawPort();
	/**
	for(var i=0;i<1500;i++){
		testerArray[i] = new killTesters(i+0.4124123);
		testerArray[i].drawTester();
	}
	**/
	tool.onMouseMove = function(event){
		mousePos = event.point;
	}
	
	tool.onMouseDown = function(event){
		if(upArrow.contains(mousePos)||downArrow.contains(mousePos)){
			if(upArrow.contains(mousePos)){
				if(currRings<maxRings){
					currRings++;
					theUI.updateNum();
					if(currRings==maxRings){
						upArrow.fillColor = 'red';
						upArrow.strokeColor = 'red';
					}
				}else{
					//Flash arrow
				}
			}else{
				if(currRings>minRings){
					currRings--;
					theUI.updateNum();
					if(currRings==minRings){
						downArrow.fillColor = 'red';
						downArrow.strokeColor = 'red';
					}
				}else{
					//Flash arrow
				}
			}
		}else{
			UIGroup.fillColor = mazeColor;
			UIGroup.strokeColor = mazeColor;
		}
	}
	//mazeGroup.selected = true;
	
	paper.view.onFrame = function(event){
		if(gameStart){
		}
		
		thePlayer.movePlayer(mousePos.x,mousePos.y);
		
		//Mouse position related actions
		if(upArrow.contains(mousePos)||downArrow.contains(mousePos)){
			if(upArrow.contains(mousePos)){
				if(currRings<maxRings){
					upArrow.fillColor = 'green';
					upArrow.strokeColor = 'green';
				}else{
					upArrow.fillColor = 'red';
					upArrow.strokeColor = 'red';
				}
			}else{
				if(currRings>minRings){
					downArrow.fillColor = 'green';
					downArrow.strokeColor = 'green';
				}else{
					downArrow.fillColor = 'red';
					downArrow.strokeColor = 'red';
				}
			}
		}else{
			UIGroup.fillColor = mazeColor;
			UIGroup.strokeColor = mazeColor;
		}
		
		if(thePlayer.hasSphere()==false){
			if(thePort.checkPort()){
				thePlayer.pickupPlayerSphere();
			}
		}
		//The +0.5 on mousePos.y is a jank way of solving a weird issue with the
		//player getting murdered at seemingly arbitrary y values that are all integers.
		//The issue seems to be with Paper js' fill algo, might file a ticket later.
		if(thePlayer.doesIntersect()){
			thePlayer.paint();
		}
		/**
		for(var i=0;i<1500;i++){
			//console.log(testerArray[i].returnY());
			if(testerArray[i]!=null){	
				if(mazeGroup.contains(1,testerArray[i].returnY())){
					testerArray[i].scream();
				}
			}
		}
		**/
		//console.log(enterSegGroup.contains(mousePos));
		paper.view.update();
	}
	
}

