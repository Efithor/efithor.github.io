//Expirimental page for finding a better way to draw circles.
//The central element for the Node Orange webpage. 
//Involves a circular maze that constantly rotates, and is thus navigated
//by a ball. The maze is procedurally generated. 

//Generate maze
//The maze is four concentric rings with holes in rings 2 and 3 and walls in between 1, 2, 
//and 3. 

/**
TODO:
Ensure cursor vanishes whenever mouse leaves canvas.
Quash bugs

Bugs
-Player dieing in the middle of the maze.
-Player lagging in the middle of maze.
Cursor to ball transition.
Create death animation
Create transition animation
Create victory animation.
Create chevrons to direct player into maze
Create story
Create music/sound.
Optimize!
**/


//Define globals.
var mazeSpeed = 0.05;
var currRings = 4;
var maxRings = 4;
var minRings = 1;
var mazeColor = 'lime';
var playerColor = 'red';
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
var readArray = [];
var ringSep = 64;
var inEntGroup = false;
var roundCount = 0;
var paintTrail;
var theDate = new Date();
var FPS = 0;
var mazeCenterX;
var mazeCenterY;
var mazeCenter;
var Core;



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
	this.shadowCount = 3;
	
	//Methods

	/*
	Generate maze method. Procedurally generates the maze to prevent any sections from
	being walled off, and that there is one entrance and exit. Then passes this info to
	the draw maze method in the form of an array of booleans.
	
	Parameters
		One entrance and one exit
		At least two walls in the outer ring, each between the entrance and exit.
		At least one gap in the inner rings.
		No section of the maze is walled off.
		No hanging walls.
		No walls next to each other.
	
	Segment Lib
		0-7 Inner ring
		8-23 Middle ring
		24-55 Outer ring
		
	Wall lib
		0-7 Inner Ring
		8-23 Middle Ring
	
		
	*/
	maze.prototype.generateMaze = function(){
		//Clear arrays.
		this.clearPaths();
		walls.length = 0;
		segments.length = 0;
		enterZone = -1;
		exitZone = -1;
		checkedArray.length = 0;
		mazeGroup.remove();
		mazeGroup = new paper.Group();
		
		//Make an entrance and exit.
		this.generateOuterRing();
		//Make the rings
		for(var i=0;i<currRings;i++){
			this.generateRing(i,segChance);
		}
		//Generate the initial walls.
		this.generateWalls(wallChance);
		//Check if the maze meets standards. If not, fix maze.
		this.checkMaze();
		//Check to ensure that there is are least two walls between the entrance and exit on the outer ring, one in the clockwise direction and the other CCW.
		//If not, regen the maze.
		if((this.wallOrExit(true)!=true)||(this.wallOrExit(false)!=true)){
			this.generateMaze();
		}
	}
	
	maze.prototype.clearPaths = function(){
		for(i=0;i<enterSeg.length;i++){
			if(enterSeg[i]!=null){
				enterSeg[i].remove();
			}
			if(exitSeg[i]!=null){
				exitSeg[i].remove();
			}
		}
		for(var i=0;i<segments.length;i++){
			if(segments[i]!=false&&segments[i]!=null&&segments[i]!=true){
				segments[i].remove();
			}
		}
		for(var i=0;i<walls.length;i++){
			if(walls[i]!=false&&walls[i]!=null&&walls[i]!=true){
				walls[i].remove();
			}
		}
		if(Core!=null){
			Core.remove();
		}
	}
	
	maze.prototype.generateOuterRing = function(){
		var ent = Math.floor(Math.random()*(this.ringBorder(currRings,false)-this.ringBorder(currRings-1,false))+this.ringBorder(currRings,true));
		var ext = Math.floor(Math.random()*(this.ringBorder(currRings,false)-this.ringBorder(currRings-1,false))+this.ringBorder(currRings,true));
		var redoOuterRing = false;
		
		//Ensure ent and ext are not the same.
		if(ent==ext){
			redoOuterRing = true;
		}
		//Ensure ent and ext are at least 2*currRings + 1 away.
		if(ent>ext&&redoOuterRing==false){
			var CWSep = ent-ext;
		}
		if(ent<ext&&redoOuterRing==false){
			var CWSep= ext-ent;
		}
		if(CWSep<((currRings*2)+1)){
			redoOuterRing=true;
		}
		CCWSep = (this.ringBorder(currRings,false)-this.ringBorder(currRings-1,false)) - CWSep;
		if(CCWSep<((currRings*2)+1)){
			redoOuterRing=true;
		}
		//Ensure proper distance from borders.
		if((((ent-this.ringBorder(currRings,true))<(currRings*2+1))||((ext-this.ringBorder(currRings,true))<(currRings*2+1))||((this.ringBorder(currRings,false)-ent)<(currRings*2+1))||((this.ringBorder(currRings,false)-ext)<(currRings*2+1)))&&redoOuterRing==false){
			redoOuterRing=true;
		}
		if(redoOuterRing==false){
			for(var i=this.ringBorder(currRings,true);i<this.ringBorder(currRings+1,true);i++){
				if (i==ent || i==ext){
					for(q=i;q<(i+currRings);q++){
						segments[q]=false;
					}
				}else{
					if(segments[i]!=false){
						segments[i]=true;
					}
				}
			}
		}
		enterZone = ent;
		exitZone = ext;
		
		if(redoOuterRing==true){
			this.generateOuterRing();
		}
	}
	
	//Generate arbitrary ring. Takes a ring number and the probability of a segment spawning in.
	//Checks to ensure that two blank segments are not next to each other.
	//Very small chance of running into the stack size limit for any given ring chance, which increases the closer to 0 or 1 ringchance gets. 
	//This may also be an issue for the wallgen algo. 
	maze.prototype.generateRing = function(ringNum, ringChance){
		//Randomly generate ring.
		//General equation for generating inner rings.
		for(var i=((Math.pow(2,ringNum)-1)*8);i<((Math.pow(2,ringNum+1)-1)*8);i++){
			if (Math.random() <= ringChance){
				segments[i]=true;
			}else{
				segments[i]=false;
			}
		}
		
		
		//Checks
		var trueCount = 0;
		//Check to ensure at least one gap. 
		for(var i=((Math.pow(2,ringNum)-1)*8);i<((Math.pow(2,ringNum+1)-1)*8);i++){
			if(segments[i]==true){
				trueCount++;
			}
		}
		if(trueCount==(((Math.pow(2,ringNum+1)-1)*8)-(8*(Math.pow(2,ringNum)-1)))){ 
			this.generateRing(ringNum,ringChance);
		}
		//Check that gaps are the proper size.
		for(var i=((Math.pow(2,ringNum)-1)*8);i<((Math.pow(2,ringNum+1)-1)*8);i++){
			if(segments[i]==false){
				//console.log("Gap at "+i);
				if(this.gapCheck(i)){
					i=(((Math.pow(2,ringNum)-1)*8)-1);
					//console.log("Setting i to "+i)
				}
			}
		}
			
	}
	maze.prototype.gapCheck = function(i){
		var gapCount=0;
		var g = i;
		while(segments[g]==false){
			gapCount++;
			if(g==this.ringBorder(this.segToRing(i),false)){
				g=this.ringBorder(this.segToRing(i),true);
			}else{
				g++;
			}
		}
		g=i;
		gapCount--;
		while(segments[g]==false){
			gapCount++;
			if(g==this.ringBorder(this.segToRing(i),true)){
				g=this.ringBorder(this.segToRing(i),false);
			}else{
				g--;
			}
		}
		//console.log("Gapcount: "+gapCount+" Should have "+this.segToRing(i));
		//console.log(segments);
		if(this.segToRing(i)!=0 && gapCount<this.segToRing(i)){
			//console.log("Widening gap at "+g);
			segments[g]=false;
			return true;
		}
		if(this.segToRing(i)!=0 && gapCount>this.segToRing(i)){
			//console.log("Shrinking gap at "+(g+1));
			if(g==this.ringBorder(this.segToRing(i),false)){
				segments[this.ringBorder(this.segToRing(i),true)]=true;
			}else{
				segments[g+1]=true;
			}
			return true;
		}
		if(this.segToRing(i)==0 && gapCount<(this.segToRing(i)+1)){
			//console.log("(Ring 0) Widening gap at "+g);
			segments[g]=false;
			return true;
		}
		if(this.segToRing(i)==0 && gapCount>(this.segToRing(i)+1)){
			if(g==this.ringBorder(this.segToRing(i),false)){
				segments[this.ringBorder(this.segToRing(i),true)]=true;
			}else{
				segments[g+1]=true;
			}
			return true;
		}
		return false;
	}
	
	//The generate walls method.
	maze.prototype.generateWalls = function (wallChance){
		//Make the walls
		for (var i=0;i<this.ringBorder(currRings+1,true);i++){
			//if it meets the random requirement and is not over a gap, make it true.
			//segment 0 governs wall 9, 1 governs wall 11, 2 governs wall 13...
			//Allso ensure that it isn't under a gap.
			//Ensure that no wall is generated near the entrance in the counterclockwise direction.
			if((this.segToRing(i)==currRings)&&(i-enterZone<=2+currRings)){
				walls[i]=false;
			}else{
				if(Math.random() <= wallChance){
					if(i<8){
						//No walls in first ring.
						walls[i]=false;
					}else{
						if (i%2 == 0){
						//Account for even walls. The bottom must have one adjacent segment and the top must have one adj seg.
						//Check for border.
							if(i==this.ringBorder(this.segToRing(i),true)){
								if(((segments[this.ringBorder(this.segToRing(i-1),true)]==true)||(segments[this.ringBorder(this.segToRing(i-1),false)])==true)&&((segments[i]==true)||(segments[(this.segToRing(i,false))]==true))){
									walls[i]=true;
								}else{
									walls[i]=false;
								}
							}else{
								if((((segments[Math.floor((i-9)/2)])==true||(segments[Math.ceil((i-9)/2)])==true))&&((segments[i]==true)||(segments[i]==true))){
									walls[i]=true;
								}else{
									walls[i]=false;
								}
							}
						}else{
							//Account for odd walls. The bottom must be planted, and the top must have one adj seg.
							if((segments[i]==true||segments[i-1]==true)&&(segments[((i-9)/2)])){
								walls[i]=true;
							}else{
								walls[i]=false;
							}
						}
					}
				}else{
				walls[i]=false;
				}
			}
		}
	}
	
	//The Check Maze method. Ensures the maze meets standards by calling the check zone method.
	//And then scanning the checked array. If it fails, the method calls the fix maze method.
	maze.prototype.checkMaze = function(){
		//Clear the checkedArray.
		checkedArray.length = 0;
		/**
		console.log("---------------");
		console.log("Checking the following maze:")
		console.log("enterZone:"+enterZone);
		console.log("exitZone:"+exitZone); 
		console.log("Walls:");
		console.log(walls);
		console.log("Segments:");
		console.log(segments);
		**/
		//Check maze to ensure that every part is connected to each other.
		this.checkZone(enterZone);
		//Scan through checked array. If maze fails, fix maze and check again.
		var needsFixing = false;
		/**
		console.log("CheckedArray:");
		console.log(checkedArray);
		**/
		for(var i=0;i<this.ringBorder(currRings+1,true);i++){
			if(checkedArray[i]!=true){
				needsFixing = true;
			}
		}
		if (needsFixing == true){
			/**
			console.log("Fixing Maze");
			**/
			this.fixMaze();
			this.checkMaze();
		}
	}
	//Fix maze method. Is called in the event of a failed maze. Deletes a random border
	//wall.
	maze.prototype.fixMaze = function(){
		var borderSpots = [];
		var q = 0;
		//Scan through maze, find all the places where checkedArray has a null value next to a true value.
		for(var i=0;i<checkedArray.length;i++){
			var zoneToCheck;
			//Determine current ring.
			var currRing = Math.floor(Math.log2((i/8)+1));
			//Check clockwise.
			if(i==8*(Math.pow(2,currRing)-1)){
				zoneToCheck = 8*(Math.pow(2,currRing+1)-1)-1;
			}else{
				zoneToCheck = i-1;
			}
			if(checkedArray[i]==true && checkedArray[zoneToCheck]!=true){
				borderSpots[q]=i;
				q++;
			}
			
			//Check counterclockwise.
			if(i==8*(Math.pow(2,currRing+1)-1)-1){
				zoneToCheck = 8*(Math.pow(2,currRing)-1);
			}else{
				zoneToCheck = i+1;
			}
			if(checkedArray[i]==true && checkedArray[zoneToCheck]!=true){
				borderSpots[q]=zoneToCheck;
			}
		}
		//Choose one of these spots at random and delete its wall.
		//console.log("borderSpots:");
		//console.log(borderSpots);
		var wallToDelete = borderSpots[Math.floor(Math.random()*borderSpots.length)];
		//console.log("deleteing wall " + wallToDelete);
		walls[wallToDelete] = false;
	}
	
	//Check zone method.
	maze.prototype.checkZone = function (currZ){
		var nextZone;
		
		//Determine current ring.
		var currRing = Math.floor(Math.log2((currZ/8)+1));
		
		//Mark current zone as checked.
		checkedArray[currZ] = true;
		
		//Check clockwise zone
		//Check for border, else just reduce it by one.
		if(currZ==8*(Math.pow(2,currRing)-1)){
			nextZone = 8*(Math.pow(2,currRing+1)-1)-1;
		}else{
			nextZone = currZ-1;
		}
		//Ensure clockwise zone is not allready checked and that there is no wall there, if not, check zone.
		if(checkedArray[nextZone]!=true && walls[currZ]!=true){
			this.checkZone(nextZone);
		}
		
		//Check counterclockwise zone
		//Check for border, else just increase by one.
		if(currZ==8*(Math.pow(2,currRing+1)-1)-1){
			nextZone = 8*(Math.pow(2,currRing)-1);
		}else{
			nextZone = currZ+1;
		}
		//Ensure CCW zone is not allready checked and that there is no wall there, if not, check zone.
		if(checkedArray[nextZone]!=true && walls[nextZone]!=true){
			this.checkZone(nextZone);
		}
		
		//Check inner zone
		//Check if the zone is even or odd
		if(currZ%2==0){
			nextZone = (currZ-8)/2;
		}
		if(currZ%2==1){
			nextZone = (((currZ-8)/2)-0.5);
		}
		//Ensure inner zone is not allready checked and that there is no segment there, if not, check zone.
		if(checkedArray[nextZone]!=true && segments[nextZone]!=true && nextZone >= 0){
			this.checkZone(nextZone);
		}
		
		//Check outer zone
		nextZone = 8+(2*currZ);
		//Ensure outer  zone is not allready checked, that there is no segment there, and that the current zone is not an entrance or exit zone. if not, check zone.
		if(checkedArray[nextZone]!=true && segments[currZ]!=true && this.segToRing(currZ)!=currRings){
			this.checkZone(nextZone);
		}
		
	}
	//Wall or Exit method. Starting from the entrance, checks around the maze to see if it runs into a wall or the exit first.
	//This is to ensure the maze is sufficiently complex to draw. The maze takes a boolean, which if true, checks clockwise. 
	//If false, checks counterclockwise. Returns a boolean, true if it hits a wall, false if it hits the exit.
	maze.prototype.wallOrExit = function(clockwise){
		//console.log("Checking Complexity");
		var clkwse = clockwise;
		var currCheck = enterZone;
		var CCWZone;
		if (enterZone == (8*(Math.pow(2,2+1)-1)-1)){
				CCWZone = 8*(Math.pow(2,2)-1);
		}else{
				CCWZone = enterZone+1;
		}
		for(var i=0;i<((8*(Math.pow(2,currRings+1)-1))-8*(Math.pow(2,currRings)-1));i++){
			//console.log("Currcheck:"+currCheck);
			//console.log("CCWZone:"+CCWZone);
			if(clkwse==true){
				//Check that current zone is not the exit zone. If not, check for a wall.
				if(currCheck==exitZone){
					//console.log("Failed on Clockwise check.");
					return false;
				}
				if(walls[currCheck]==true){
					//console.log("Passed on Clockwise check.");
					return true;
				}
				//Otherwise, check for a border to cross. If none found, decrease currCheck.
				if(currCheck == 8*(Math.pow(2,currRings)-1)){
					currCheck = (8*(Math.pow(2,currRings+1)-1)-1);
				}else{
					currCheck--;
				}
			}else{
				//Check that the current zone is not the exit zone. If not, check for a counterclockwise wall.
				if(currCheck==exitZone){
					//console.log("Failed on counter Clockwise check.");
					return false;
				}
				if(walls[CCWZone]==true){
					//console.log("Passed on counter Clockwise check.");
					return true;
				}
				//Otherwise, increase enterZone and increase CCWZone, accounting for borders.
				if(currCheck == (8*(Math.pow(2,currRings+1)-1)-1)){
					currCheck = 8*(Math.pow(2,currRings)-1);
				}else{
					currCheck++;
				}
				if(CCWZone == (8*(Math.pow(2,currRings+1)-1)-1)){
					CCWZone = 8*(Math.pow(2,currRings)-1);
				}else{
					CCWZone++;
				}
			}
				
		}
	}
	
	//Utility method. Given a ring number and a boolean, returns the either the start of the ring or the end number.
	maze.prototype.ringBorder = function(ringNum, start){
		if (start == true){
			return 8*(Math.pow(2,ringNum)-1);
		}else{
			return 8*(Math.pow(2,ringNum+1)-1)-1;
		}
	}
	//Utility method. Given a segment or wall, determine the ring number.
	maze.prototype.segToRing = function(segNum){
		return Math.floor(Math.log2((segNum/8)+1));
	}
	
	//Utility method. Given a number, return the next number in the sequence.
	maze.prototype.increaseNum = function(num){
		this.num = num;
		if(this.ringBorder(this.segToRing(this.num),false)==this.num){
			this.num = this.ringBorder(this.segToRing(this.num),true);
		}else{
			this.num++;
		}
		return this.num;
	}
	//Utility method. Given a number, return the previous number in the sequence.
	maze.prototype.decreaseNum = function(num){
		this.num = num;
		if(this.ringBorder(this.segToRing(this.num),true)==this.num){
			this.num = this.ringBorder(this.segToRing(this.num),false);
		}else{
			this.num--;
		}
		return this.num;
	}
	//The draw maze method. Takes variables from the design maze function and draws the maze.
	//For now it just draws all the components of the maze. The parts of the maze are globally
	//accessible to allow for collision detection.
	maze.prototype.drawMaze = function(coreX,coreY, ringNum, ringThickness, ringSep){
		//Draw the core. The core never changes, so it doesn't have its own method.
		Core = new paper.Path.Circle(new paper.Point(coreX, coreY), 20);
		Core.fillColor = mazeColor;
		Core.strokeColor = mazeColor;
		Core.shadowColor = mazeColor;
		Core.shadowBlur = 12;
		
		//Draw the appropriate number of rings given a ring number.
		this.exitDrawn = false;
		this.enterDrawn = false;
		for (var i=0;i<segments.length;i++){
			this.seg;
			this.seqSegCount = 0;
			this.drawSeg = false;
			if(segments[i]==true && i!=enterZone && i!=exitZone){
				this.drawSeg = true;
				this.checkNum = i;
				//Ensure that we're at the back.
				while(segments[this.decreaseNum(this.checkNum)]==true){
					this.checkNum = this.decreaseNum(this.checkNum);
				}
				this.leastNum = this.checkNum;
				segments[this.checkNum]=false;
				//Step forward, counting each one and then marking it false to prevent repeats.
				while(segments[this.increaseNum(this.checkNum)]==true){
					segments[this.checkNum]=false;
					this.seqSegCount++;
					this.checkNum = this.increaseNum(this.checkNum);
					
				}
				segments[this.checkNum]=false;
				
				
			}

			if(i==enterZone&&this.enterDrawn==false){
				console.log("drawingExit...");
				this.enterDrawn=false
				this.drawSeg = true;
				this.seqSegCount = currRings;
				this.leastNum = i;
			}
			
			if(i==exitZone&&this.exitDrawn==false){
				console.log("drawingentrance...");
				this.exitDrawn=false
				this.drawSeg = true;
				this.seqSegCount = currRings;
				this.leastNum = i;

			}

			if(this.drawSeg==true){
				//Draw the segment.
				this.seg = this.advancedSeg(ringSep*(this.segToRing(this.checkNum)+1),this.seqSegCount,this.segToRing(this.checkNum),ringThickness);
				//Rotate the segment into position. It should be rotated to the number at the back.
				this.seg.rotate((((Math.PI/(Math.pow(2,this.segToRing(this.leastNum)+2)))*(-(this.leastNum-this.ringBorder(this.segToRing(this.leastNum),true)))*57.2958)+90),mazeCenter);
				if(i!=enterZone&&i!=exitZone){
					mazeGroup.addChild(this.seg);
				}
				if(i==enterZone){
					enterSegGroup.addChild(this.seg);
				}
				if(i==exitZone){
					exitSegGroup.addChild(this.seg);
				}
			}		
		}
		
		mazeGroup.fillColor = mazeColor;
		mazeGroup.strokeColor = mazeColor;
		mazeGroup.closed = true;
		mazeGroup.shadowColor = mazeColor;
		mazeGroup.shadowBlur = 12;
		
		enterSegGroup.closed = true;
		enterSegGroup.shadowColor = mazeColor;
		enterSegGroup.shadowBlur = 12;
		
		exitSegGroup.closed = true;
		exitSegGroup.shadowColor = mazeColor;
		exitSegGroup.shadowBlur = 12;
		
		//Draw walls and rotate the wall into the correct position.
		for (var i=0;i<walls.length;i++){
			if(walls[i]==true){
				walls[i]=this.drawWall(this.segToRing(i),10,ringSep,ringThickness);
				walls[i].rotate(-(45/Math.pow(2,this.segToRing(i)))*(i-this.ringBorder(this.segToRing(i),true)),mazeCenter);
				mazeGroup.addChild(walls[i]);
			}
		}
	}
	
	//Draws a basic segment. 

	maze.prototype.drawSegment = function(radius, ringNum, thickness){
		//Determine angles of segments
		var frmAng = Math.PI/2;
 
		var throughAng = ((Math.pow(2,ringNum+2)-1)/(8*(Math.pow(2,ringNum))))*Math.PI;
		
		var toAng = ((Math.pow(2,ringNum+1)-1)/(8*(Math.pow(2,ringNum-1))))*Math.PI;
		
		//Detemine points for segments
		var frm = new paper.Point(mazeCenterX+(radius*Math.cos(frmAng)), mazeCenterY+(radius*Math.sin(frmAng)));
		var through = new paper.Point(mazeCenterX+(radius*Math.cos(throughAng)), mazeCenterY+(radius*Math.sin(throughAng)));
		var to = new paper.Point(mazeCenterX+(radius*Math.cos(toAng)),mazeCenterY+(radius*Math.sin(toAng)));

		var frm2 = new paper.Point(mazeCenterX+((radius+thickness)*Math.cos(frmAng)), mazeCenterY+((radius+thickness)*Math.sin(frmAng)));
		var through2 = new paper.Point(mazeCenterX+((radius+thickness)*Math.cos(throughAng)), mazeCenterY+((radius+thickness)*Math.sin(throughAng)));
		var to2 = new paper.Point(mazeCenterX+((radius+thickness)*Math.cos(toAng)), mazeCenterY+((radius+thickness)*Math.sin(toAng)));

		var arc1 = new paper.Path.Arc(frm, through, to);

		var arc2 = new paper.Path.Arc(to2, through2, frm2);

		arc1.join(arc2);
		arc1.fillColor = mazeColor;
		arc1.strokeColor = mazeColor;
		arc1.selected = false;
		arc1.closed = true;
		
		arc1.fillColor.alpha = 0.9;
		arc1.strokeColor.alpha = 0.9;
		arc1.shadowColor = mazeColor;
		arc1.shadowBlur = 12;

		
		return arc1;
		
	}

	maze.prototype.advancedSeg = function(radius,segCount,ringNum,thickness){
		this.radius = radius;
		this.ringNum = ringNum;
		this.segCount = segCount;
		this.thickness = thickness;
		
		this.frmAng = 0;
		this.throughAng = -(Math.PI/(Math.pow(2,this.ringNum+3)))*(this.segCount+1); //Angle inbetween the frmAng and the toAng.
		this.toAng = -(Math.PI/(Math.pow(2,this.ringNum+2)))*(this.segCount+1); //Angle equal to one segment in the current ring times the seg count.
		
		this.frm = new paper.Point(mazeCenterX+(this.radius*Math.cos(this.frmAng)), mazeCenterY+(this.radius*Math.sin(this.frmAng)));
		this.through = new paper.Point(mazeCenterX+(this.radius*Math.cos(this.throughAng)), mazeCenterY+(this.radius*Math.sin(this.throughAng)));
		this.to = new paper.Point(mazeCenterX+(this.radius*Math.cos(this.toAng)),mazeCenterY+(this.radius*Math.sin(this.toAng)));
		
		this.frm2 = new paper.Point(mazeCenterX+((this.radius+this.thickness)*Math.cos(this.frmAng)), mazeCenterY+((this.radius+this.thickness)*Math.sin(this.frmAng)));
		this.through2 = new paper.Point(mazeCenterX+((this.radius+this.thickness)*Math.cos(this.throughAng)), mazeCenterY+((this.radius+this.thickness)*Math.sin(this.throughAng)));
		this.to2 = new paper.Point(mazeCenterX+((this.radius+this.thickness)*Math.cos(this.toAng)), mazeCenterY+((this.radius+this.thickness)*Math.sin(this.toAng)));
		
		this.arc1 = new paper.Path.Arc(this.frm, this.through, this.to);
		this.arc2 = new paper.Path.Arc(this.to2, this.through2, this.frm2);
		
		this.arc1.join(this.arc2);
		this.arc1.closed = true;
		
		return this.arc1;
	}
	
	//Draw wall method (Ring number, thickness of wall, seperation of rings, thickness of rings)
	maze.prototype.drawWall = function(ringNum,thickness,ringSep,ringThickness){
		var rect = new paper.Rectangle(mazeCenterX-(thickness/2),mazeCenterY+(ringSep*ringNum),thickness,ringSep+ringThickness);
		var rectPath = new paper.Path.Rectangle(rect);
		rectPath.fillColor = mazeColor;
		rectPath.strokeColor = mazeColor;
		rectPath.selected = false;
		rectPath.shadowColor = mazeColor;
		rectPath.shadowBlur = 12;
		
		return rectPath;
	}

	//Rotate maze method. Goes through each part of the segments and wall arrays and if the spot is not blank,
	//rotates the path.
	maze.prototype.rotateMaze = function(speed){
		mazeGroup.rotate(speed,mazeCenter);
		enterSegGroup.rotate(speed,mazeCenter);
		exitSegGroup.rotate(speed,mazeCenter);
	}
	
	//After a round is won, reset exits.
	maze.prototype.resetExits = function(){
		
	}
	//Sends the maze entrance to the front to prevent false hits from the exterior kill bug. Should be invoked after cursor generation.
	maze.prototype.sendEntranceToFront = function(){
		enterSegGroup.bringToFront();
	}
};


//Interface object. How the player alters the variables of the game.
var UI = function(){
	UIGroup = new paper.Group();
	this.hider;
	this.hiderRadius;
	this.baseHiderCount = 25; 
	this.hiderCount = this.baseHiderCount;
	this.hiderLayer;
	this.isInTransition = [];
	this.FPStext;
	var ringCounter;
	
	//Draw UI
	UI.prototype.drawUI = function(){
		/**
		upArrow = new paper.Path.RegularPolygon(new paper.Point(paper.view.center.x+460,paper.view.center.y-25),3,20);
		UIGroup.addChild(upArrow);
		downArrow = new paper.Path.RegularPolygon(new paper.Point(paper.view.center.x+460,paper.view.center.y+25),3,20);
		UIGroup.addChild(downArrow);
		downArrow.rotate(180);
		upArrow.fillColor = mazeColor;
		upArrow.strokeColor = mazeColor;
		downArrow.fillColor = mazeColor;
		downArrow.strokeColor = mazeColor;
		**/
		 
		//this.bounderBox = new paper.Path.Rectangle(new paper.Point(0,0),new paper.Point(1070,720));
		//this.bounderBox.strokeColor = playerColor;
		this.FPStext = new paper.PointText(new paper.Point(500,10));
		this.FPStext.fillColor = playerColor;
		//this.FPStext.strokeColor = 'black';
	}
	 //Up arrow hover method. Whenever the mouse hovers over the up arrow and the ring number is not 5, outline the arrow in green.
	 //If the ring number is 5, outline the arrow in red.
	 
	 //Up arrow clicked method. Activate whenever the uparrow is clicked. 
	 //If clicked, generate a new maze and increase the number of rings by 1, unless the number of rings is 5, in which case flash red and do nothing.
	UI.prototype.upArrowClicked = function(){
		 
		 
	 }
	UI.prototype.drawHider = function(){
		hiderRadius = (ringSep*(currRings+1));
		this.hider = new paper.Path.Circle(new paper.Point(mazeCenterX, mazeCenterY), hiderRadius );
		//hider.fillColor = mazeColor;
		//hider.strokeColor = mazeColor;
		this.hiderCount = this.baseHiderCount;
		
		this.hiderLayer = new paper.Group(this.hider);
		this.hiderLayer.addChild(this.testSquare);
		this.hiderLayer.clipped = true;
		

		//this.hiderRange = 7+(currRings-1)*3;
		this.hiderRange = 5;
		
		for(var i=-this.hiderRange;i<this.hiderRange;i++){
			this.yPos = mazeCenterY + i*26*currRings;
			for(var q=-this.hiderRange;q<this.hiderRange;q++){
				this.xPos = mazeCenterX + q*26*currRings;
				this.hiderSquare = new paper.Path.Rectangle(new paper.Point(this.xPos,this.yPos),26*currRings);
				this.hiderSquare.strokeColor = mazeColor;
				this.hiderSquare.fillColor = mazeColor;
				this.hiderSquare.strokeColor.brightness = Math.random();
				this.hiderSquare.fillColor.brightness = this.hiderSquare.strokeColor.brightness;
				this.hiderLayer.addChild(this.hiderSquare);
				this.isInTransition[this.hiderSquare.index] = false;
			}
		}

		/**
		for(var i=-1*currRings*5;i<currRings*5;i++){
			
			this.hiderSquare = new paper.Path.Rectangle(new paper.Point(this.xPos,this.yPos),20*currRings);
		}
		**/
		
	}
	UI.prototype.animateHider = function(){
		//this.pixelToChange = (this.hiderLayer.children[Math.ceil(Math.random()*(this.hiderLayer.children.length-1))]);
		//console.log(this.pixelToChange.strokeColor);
		//this.pixelToChange.strokeColor._canvasStyle == 'rgb(0,0,0)'
		for(i=0;i<10;i++){	
			this.pixelToChange = (this.hiderLayer.children[Math.ceil(Math.random()*(this.hiderLayer.children.length-1))]);
			if(this.pixelToChange.fillColor.brightness >= 0.9){
				this.pixelToChange.fillColor.brightness = 0.1;
				this.pixelToChange.strokeColor.brightness = 0.1;
			}else{
				this.pixelToChange.fillColor.brightness +=0.05;
				this.pixelToChange.strokeColor.brightness +=0.05;
			}
			/**
			if(Math.random()>0.5){
				console.log(this.pixelToChange.fillColor.brightness);
				this.pixelToChange.strokeColor = 'black';
				this.pixelToChange.fillColor = 'black';
			}else{
				this.pixelToChange.strokeColor = mazeColor;
				this.pixelToChange.fillColor = mazeColor;
			}
			**/
		}
		/**
		if(Math.random() > 1){
			//hider.fillColor = mazeColor;
			//hider.strokeColor = mazeColor;
		}else{
			//hider.fillColor = '#332900';
			//hider.strokeColor = '#332900';
		}
		**/
	}


	

	UI.prototype.displayFPS = function(){
		this.FPStext.content = FPS;
	}
	
}

/**Text typer object. Given certain perameters, generate a text box.
frameDelay - how many frames each char of text should take to be drawn.
lineCount - how many lines long the text box should be.
baseCursorInt - how often the cursor should blink on and off.
boxX, boxY, boxWidth, boxHeight - define box dimentions.
**/
var textTyper = function(frameDelay,lineCount,baseCursorInt,boxX,boxY,boxWidth,boxHeight){
	this.horzPos = 0;
	this.vertPos = 0;
	this.boxX = boxX;
	this.boxY = boxY;
	this.boxWidth = boxWidth;
	this.boxHeight = boxHeight;
	this.typedText;
	this.frameDelay = frameDelay;
	this.lineCount = lineCount
	this.currentFrame = this.frameDelay;
	this.textCursor;
	this.readyForNextLine = true;
	this.textArray = [];
	this.numLines = lineCount;
	this.textToType = [];
	this.textBeingDrawn;
	this.baseCursorInt = 60;
	this.cursorInt = this.baseCursorInt;
	//Create the cursor
	this.textCursor = new paper.Path.Rectangle(this.boxX + 25,this.boxY + 5, 12, 25);
	this.textCursor.fillColor = 'red';
	this.textCursor.strokeColor = 'red';
	this.textCursor.shadowColor = playerColor;
	this.textCursor.shadowBlur = 12;
	//Create the text block.
	for(i=0;i<this.lineCount;i++){
		this.textArray[i] = new paper.PointText(new paper.Point(this.boxX+14,this.boxY+20*i+25));
		this.textArray[i].fontFamily = 'courier';
		this.textArray[i].fontSize = 20;
		this.textArray[i].fillColor = playerColor;
		this.textArray[i].strokeColor = 'black'
		this.textArray[i].strokeWidth = 0.1;
		//this.textArray[i].shadowColor = playerColor;
		//this.textArray[i] = 12;
	}
	this.upperRect = new paper.Path.Rectangle(this.boxX,this.boxY,this.boxWidth,this.boxHeight);
	this.upperRect.strokeColor = playerColor;
	this.upperRect.shadowColor = playerColor;
	this.upperRect.shadowBlur = 120;
	
	//The pass text method. The only method that should be accessed from the outside other than nextChar. This puts items to be printed into a list.
	textTyper.prototype.passText = function(txt){
		this.passTxt = txt;
		this.textToType[this.textToType.length] = this.passTxt;
	}
	
	//Print the next line of text.
	textTyper.prototype.getText = function(){
		//Determine if the typer is ready for anotther line
		if(this.readyForNextLine==true && this.textToType.length!=0){
			this.readyForNextLine=false;
			//Extract and remove the first item.
			this.firstElm = this.textToType[0];
			this.textToType.shift()
			return this.firstElm;
		}else{
			if(this.readyForNextLine==true && this.textToType.length==0){
				return "NOMESSAGE";
			}else{
				return this.textBeingDrawn;
			}
		}
	}
	//Each time this method is pulsed, draw another character in accordance with the draw speed. If there are no characters to draw, pull the next line.
	//If there is no next line, check for one at every pulse, in accordance with the draw speed.
	textTyper.prototype.nextChar = function(){
		//Manage cursor
		this.manageCursor();
		//Control draw speed.
		if(this.currentFrame==0){
			this.currentFrame = this.frameDelay;
			this.textBeingDrawn = this.getText();
			//If there is no message to display, return.
			if(this.textBeingDrawn == "NOMESSAGE"){
				return;
			}
			//If the message is to clear the text, run the clear text method.
			if(this.textBeingDrawn == "ACTION:CLEAR"){
				this.clearText();
				return;
			}
			//See if we need to draw another character, if not, return carrage.
			//console.log(typeof this.textArray[this.vertPos].content.length);
			if(this.vertPos!=this.lineCount){
				if(this.textBeingDrawn.length > this.textArray[this.vertPos].content.length){
					//Draw the next character.
					//If the character is a space, keep drawing characters until you hit a non-space.
					if(this.textBeingDrawn.charAt(this.horzPos)==' '){
						while(this.textBeingDrawn.charAt(this.horzPos)==' '){
							this.textArray[this.vertPos].content = (this.textArray[this.vertPos].content).concat(this.textBeingDrawn.charAt(this.horzPos));
							this.horzPos++;
						}
					}else{
						this.textArray[this.vertPos].content = (this.textArray[this.vertPos].content).concat(this.textBeingDrawn.charAt(this.horzPos));
						this.horzPos++;
					}
				}else{
					//If the line is finished, go to the next line.
					this.returnCarrage();
				}
			}else{
				this.returnCarrage();
			}
		}else{
			this.currentFrame--;
		}
	}
	//Move to the next line
	textTyper.prototype.returnCarrage = function(){
		//Check to see if we're out of lines.
		if(this.vertPos < this.lineCount){
			this.horzPos = 0;
			this.vertPos++;
			this.readyForNextLine=true;
		}else{
			//Delete the top line, and shift lines up one.
			for(i=0;i<this.lineCount-1;i++){
				this.textArray[i].content = this.textArray[i+1].content;
				//paper.view.update();
			}
			this.textArray[this.lineCount-1].content = "";
			this.vertPos--;
		}
	}
	//Clear the text.
	textTyper.prototype.clearText = function(){
		for(i=0;i<this.textArray.length;i++){
			this.textArray[i].content = "";
		}
		this.vertPos = 0;
		this.readyForNextLine=true;
	}
	//Manage the cursor. Advance it slightly after it finishes the text, and blink it while not moving.
	textTyper.prototype.manageCursor = function(){
		if(this.readyForNextLine==false){
			this.textCursor.position = new paper.Point(this.boxX+7+this.horzPos*12,this.boxY+20+this.vertPos*20);
		}else{
			this.textCursor.position = new paper.Point(this.boxX+7+(this.horzPos+1)*12,this.boxY+20+this.vertPos*20);
			this.blinkCursor();
		}
	}
	//Blink the cursor.
	textTyper.prototype.blinkCursor = function(interval){
		if(this.cursorInt == 0){
			this.cursorInt = this.baseCursorInt;
			if(this.textCursor.fillColor._canvasStyle=="rgb(0,0,0)"){
				this.textCursor.fillColor = "red";
				this.textCursor.strokeColor = "red";
			}else{
				this.textCursor.fillColor = 'black';
				this.textCursor.strokeColor = "black";
			}
		}else{
			this.cursorInt--;
		}
	}
}

//Story manager. Reads gamestate and generates messages based of it.
var storyManager = function(theTyper,storyTyper){
	this.gameStart;
	this.roundWon;
	this.gameLoss;
	this.currRings;
	this.roundCount;
	this.theTyper = theTyper;
	this.storyTyper = storyTyper;
	this.vulnShown = false;
	this.currLevShown = false;
	this.startMessageShown = false;
	this.lossMessageShown = false;
	this.winMessageShown = false;
	this.chapter1_0WinShown=false;
	this.chapter1_1Shown=false;
	
	this.chapter1_0Shown=false;
	
	storyManager.prototype.readGameState = function(gameStart,roundWon,gameLoss,currRings,roundCount){
		this.gameStart = gameStart;
		this.roundWon = roundWon;
		this.gameLoss = gameLoss;
		this.currRings = currRings;
		this.roundCount = roundCount;
		this.chooseDataMessage();
		this.chooseStoryMessage();
	}
	
	//Clear the messages.
	storyManager.prototype.clear = function(){
		this.vulnShown = false;
		this.currLevShown = false;
		this.startMessageShown = false;
		this.lossMessageShown = false;
		this.winMessageShown = false;
		theTyper.passText(this.clearMessage());
	}
	
	storyManager.prototype.chooseDataMessage = function(){
		//Display vulnerability message.
		if(this.gameStart==false&&this.vulnShown==false){
			this.theTyper.passText(this.vulnMessage(),2);
			this.vulnShown=true;
			return;
		}
		//Display current level.
		if(this.gameStart==false&&this.currLevShown==false){
			this.theTyper.passText(this.currLevelMessage(),2);
			this.currLevShown = true;
			return;
		}
		//Display round starting message.
		if(this.gameStart&&this.startMessageShown==false){
			this.theTyper.passText(this.startMessage(),2);
			this.startMessageShown=true;
			return;
		}
		//Display a victory message.
		if(this.roundWon&&this.winMessageShown==false){
			this.theTyper.passText(this.winMessage(),2);
			this.theTyper.passText(this.displayPayloadMessage());
			this.winMessageShown=true;
			this.clear();
			return;
		}
		//Display a loss message.
		if(this.gameLoss&&!this.lossMessageShown){
			this.theTyper.passText(this.lossMessage(),2);
			this.lossMessageShown=true;
			this.clear();
			return;
		}
	}
	
	//Messages
	
	storyManager.prototype.vulnMessage = function(){
		return ("VULNERABILITY DETECTED...");
	}
	
	storyManager.prototype.currLevelMessage = function(){
		return ("NODE SECURITY: " + this.currRings + "." + this.roundCount);
	}
	
	storyManager.prototype.startMessage = function(){
		return ("VULNERABILITY EXPLOITED");
	}
	
	storyManager.prototype.winMessage = function(){
		return ("PAYLOAD DOWNLOADED");
	}
	
	storyManager.prototype.displayPayloadMessage = function(){
		return ("DISPLAYING PAYLOAD:");
	}
	
	storyManager.prototype.lossMessage = function(){
		return("CONNECTION LOST");
	}
	
	storyManager.prototype.clearMessage = function(){
		return("ACTION:CLEAR");
	}
	
	//Story Typer
	
	storyManager.prototype.chooseStoryMessage = function(){
		if(currRings==1&&this.roundCount==0&&this.chapter1_0Shown==false){
			this.chapter1_0Shown=true;
			return;
		}
		if(currRings==1&&roundCount==0&&this.roundWon&&this.chapter1_0WinShown==false){
			this.chapter1_0WinMessage();
			this.chapter1_0WinShown=true;
		}
		if(currRings==1&&this.chapter1_1Shown==false&&this.roundCount==1){
			this.chapter1_1Shown=true;
			return;
		}
	}
	
	//Story Messages
	
	storyManager.prototype.testMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|         TOP SECTRET         |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|     N4 Prototype Design     |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                   ////      |");
		this.storyTyper.passText("|       <==|-----|==++++      |");
		this.storyTyper.passText("|      /      |     \\\\\\\\      |"); //Have to escape backslashes to get them to show right.
		this.storyTyper.passText("|     /    Payload    |       |");
		this.storyTyper.passText("|   Sensor            |       |");
		this.storyTyper.passText("|   Suite           Fins      |");
		this.storyTyper.passText("|-----------------------------|");
	}
	
	storyManager.prototype.chapter1_0WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|FRM:RGrey@MiamiNow.com       |");
		this.storyTyper.passText("|TO:MZIR@MiamiNow.com         |");
		this.storyTyper.passText("|SUBJ: Dead Programmer Article|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|Maurice, I made a few edits  |");
		this.storyTyper.passText("|to the artice, but good work |");
		this.storyTyper.passText("|overall. We'll have it on the|");
		this.storyTyper.passText("|site shortly.                |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-ED.                         |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|LOCAL PROGRAMMER FOUND DEAD  |");
		this.storyTyper.passText("|Maurice Zir - Reporter       |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|Leon Garcia was found dead in|");
		this.storyTyper.passText("|his Miami Beach appartment   |");
		this.storyTyper.passText("|this morning. A coworker of  |");
		this.storyTyper.passText("|his found Garcia's body after|");
		this.storyTyper.passText("|Garcia did not show up to    |");
		this.storyTyper.passText("|work for several weeks.      |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|Miami-Dade coroner Silas     |");
		this.storyTyper.passText("|McManners determined said    |");
		this.storyTyper.passText("|that Garcia died of a brain  |");
		this.storyTyper.passText("|aneurysm.                    |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter1_1WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|FRM:BenEstates@HavenNet.com  |");
		this.storyTyper.passText("|TO:MZIR@MiamiNow.com         |");
		this.storyTyper.passText("|SUBJ: YOU GOT PLAYED         |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|You think Leon died of a     |");
		this.storyTyper.passText("|brain aneurysm? I saw his    |");
		this.storyTyper.passText("|body when I opened the door  |");
		this.storyTyper.passText("|for the coworker, and last   |");
		this.storyTyper.passText("|I checked, brain aneurysms   |");
		this.storyTyper.passText("|don't cause the sucker's head|");
		this.storyTyper.passText("|to fucking explode. Leon was |");
		this.storyTyper.passText("|a good guy and allways paid  |");
		this.storyTyper.passText("|his rent on time, so I don't |");
		this.storyTyper.passText("|know why the cops would lie  |");
		this.storyTyper.passText("|to you about how or why he   |");
		this.storyTyper.passText("|died. If you want to come by,|");
		this.storyTyper.passText("|I'll let you in to check the |");
		this.storyTyper.passText("|place out.                   |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-Ben                         |");
		this.storyTyper.passText("| Ben's Estates               |");
		this.storyTyper.passText("|-----------------------------|");
		
	}
	storyManager.prototype.chapter1_2WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
		
	}
	storyManager.prototype.chapter1_4WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter1_6WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter1_8WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter2_0WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter2_2WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter2_4WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter2_6WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter2_8WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter3_0WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter3_2WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter3_4WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter3_6WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter4_0WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter4_2WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter4_4WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter4_6WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
	storyManager.prototype.chapter4_8WinMessage = function(){
		this.storyTyper.passText("|-----------------------------|");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|                             |");
		this.storyTyper.passText("|-----------------------------|");
	}
}
//Player Sphere object. Ball is guided by the cursor. Dies if it touches the maze.
var playerSphere = function(){
	var havePlayerSphere = false;
	var player;
	playerSphere.prototype.createPlayer = function(){
		player = new paper.Path.Circle(new paper.Point(-10, -10), 5);
		player.fillColor = 'red';
		player.strokeColor = 'red';
		player.shadowColor = playerColor;
		player.shadowBlur = 12;
	}
	playerSphere.prototype.pickupPlayerSphere = function(){
		havePlayerSphere = true;
	}
	playerSphere.prototype.movePlayer = function(mouseX,mouseY){
		if(havePlayerSphere==true){	
			player.position = new paper.Point(mouseX,mouseY);
		}
	}
	playerSphere.prototype.kill = function(screenShaker){
		this.screenShaker = screenShaker;
		if(havePlayerSphere==true){
			gameStart = false;
			this.screenShaker.shakeScreen(30);
			this.dropSphere();
		}
	}	
	playerSphere.prototype.dropSphere = function(){
		havePlayerSphere=false;
		player.position=new paper.Point(-10,-10);
	}
	playerSphere.prototype.hasSphere = function(){
		return havePlayerSphere;
	}
	playerSphere.prototype.doesIntersect = function(){
		if((mazeGroup.contains(player.position))||(enterSegGroup.contains(player.position))||(exitSegGroup.contains(player.position))||(Core.contains(player.position))){
			//The below if statement is to prevent a weird glitch that was killing the player randomly. 
			//Something strange about how .contains works with groups.
			if(typeof paper.project.hitTest(player.position).item.segments==='object'){
				return true;
			}
		}
	}
	playerSphere.prototype.paint = function(){
		paintTrail = new paper.Path();
		paintTrail.strokeColor = 'red';
		paintTrail.strokeWidth = 5;
	}
	playerSphere.prototype.insideMaze = function(){
		if(((player.position).getDistance(mazeCenter))<(ringSep*(currRings+1))){
			return true;
		}else{
			return false;
		}
	}
	
}

var screenShaker = function(){
	this.shakeTime = 0;
	this.yShake = 10;
	this.firstShake = true;
	this.lastShake = false;
	screenShaker.prototype.shakeScreen = function(shakeFrames){
		this.shakeFrames = shakeFrames;
		this.shakeTime = this.shakeTime + this.shakeFrames;
		console.log(this.shakeFrames);
	}
	screenShaker.prototype.shake = function(){
		if(this.shakeTime > 0){
			this.shakeTime--;
			if(this.firstShake==true||this.shakeTime==0){
				paper.view.translate(0,this.yShake*0.5);
				console.log(this.yShake*0.5);
				this.firstShake=false;
			}else{
				paper.view.translate(0,this.yShake);
				console.log(this.yShake);
			}
			this.yShake = this.yShake*(-1);
		}else{
			this.firstShake=true;
		}
	}
}

var playerCursor = function(){
	this.cursor;
	this.isHidden = true;
	
	playerCursor.prototype.createCursor = function(){
		this.cursor = new paper.Path.RegularPolygon(new paper.Point(-10, -10), 3, 10);
		this.cursor.fillColor = 'red';
		this.cursor.strokeColor = 'black';
		this.cursor.shadowColor = playerColor;
		this.cursor.shadowBlur = 12;
		this.cursor.scale(1,1.5);
		this.cursor.rotate(-45);
	}
	playerCursor.prototype.moveCursor = function(playerObject,mousePos){
		this.playerObject = playerObject;
		this.mousePos = mousePos;
		if(this.playerObject.hasSphere()==false){
			this.cursor.position = new paper.Point(this.mousePos);
		}
	}
	playerCursor.prototype.hideCursor = function(){
		//this.cursor.fillColor = 'black';
		//this.cursor.strokeColor = 'black';
		this.cursor.position = new paper.Point(-10,-10);
		this.isHidden = true;
	}
	playerCursor.prototype.showCursor = function(){
		this.isHidden = false;
	}
	playerCursor.prototype.isItHidden = function(){
		return this.isHidden;
	}
	playerCursor.prototype.sendCursorToFront = function(){
		this.cursor.bringToFront();
	}
}
/**
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
**/
/**
var killTesters = function(yVal){
	this.yVal = yVal;
	this.tester;
	this.killed = false;
	killTesters.prototype.drawTester = function(){
		this.tester = new paper.Path.Rectangle(new paper.Point(1,yVal),1);
		this.tester.fillColor = 'black';
	}
	killTesters.prototype.scream = function(){
		if(this.killed==false){
			console.log("Tester kill at" + this.yVal);
			this.killed = true;
			this.tester.fillColor = 'red';
		}
	}
	killTesters.prototype.returnY = function(){
		return this.yVal;
	}
}
**/
window.onload = function(){
	var tool = new paper.Tool();
	var canvas = document.getElementById('myCanvas');
	paper.setup(canvas);
	
	mazeCenterX = paper.view.center.x+200;
	mazeCenterY = paper.view.center.y;
	mazeCenter = new paper.Point(mazeCenterX,mazeCenterY);
	
	this.allreadyStarted = false;
	this.inExitGroup = false;
	this.roundWon = false;
	this.gameLoss = false;
	this.simpCount = 0;
	var coreGrabbed = false;
	var exitReveal = false;
	//For the Framerate counter.
	this.oldDate;
	
	theUI = new UI();
	theUI.drawUI();
	
	
	
	theMaze = new maze();
	theMaze.generateMaze();
	theMaze.drawMaze(mazeCenterX,mazeCenterY,2,20,ringSep);
	
	
	
	//theTyper.createTextCursor();
	
	
	//theTyper.typeText("VULNERABILITY DETECTED",2);
	
	theMaze.sendEntranceToFront();
	//thePort = new connectionPort();
	//thePort.drawPort();
	
	

	
	paper.view.onFrame = function(event){
		//Framrate counter
		if(Date()==this.oldDate){
			FPS++;
		}else{
			this.oldDate=Date();
			theUI.displayFPS();
			FPS=0;
		}
		
		if(true){
			theMaze.rotateMaze(mazeSpeed + roundCount*mazeSpeed);
			/**
			paintTrail.rotate(mazeSpeed + roundCount*mazeSpeed,paper.view.center);
			if(simpCount == 10){
				paintTrail.simplify();
				simpCount = 0;
			}else{
				simpCount++;
			}
			**/
			
			
		}
		paper.view.update();
	}
	
}

