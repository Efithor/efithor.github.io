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
-Can click begin button after gamestart.
-Might want to redo the statecode to make it more robust.
Cursor to ball transition.
Delay maze reveal until after text is finished

Create victory animation.
Create chevrons to direct player into maze
Create story
Create music/sound.
Optimize!
**/


//Define globals.
var mazeSpeed = 0.05;
var currRings = 1;
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
var ringThickness = 20;

var blurVal = 0;

var totalRoundsPlayed;

var backColor;
var levelOneColor = 'lime';
var levelOneBackColor = '#008000'

var levelTwoColor = 'aqua';
var levelTwoBackColor = '#009999';

var levelThreeColor = '#cc33ff';
var levelThreeBackColor = '#730099';

var levelFourColor = 'white';
var levelFourBackColor = '#999999';

var OSDNeeded = false;

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
		enterSegGroup.remove();
		exitSegGroup.remove();
		mazeGroup.remove();
		mazeGroup = new paper.Group();
		enterSegGroup = new paper.Group();
		exitSegGroup = new paper.Group();

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
		if(currRings==4&&roundCount != 19){
			Core.fillColor = 'white';
			Core.strokeColor = 'white';
			Core.shadowColor = 'white';
		}else{
			Core.fillColor = playerColor;
			Core.strokeColor = playerColor;
			Core.shadowColor = playerColor;
		}
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
				this.enterDrawn=true;
				this.drawSeg = true;
				this.seqSegCount = currRings-1;
				this.leastNum = i;
			}
			
			if(i==exitZone&&this.exitDrawn==false){
				this.exitDrawn=true;
				this.drawSeg = true;
				this.seqSegCount = currRings-1;
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
		mazeGroup.selected = false;
		mazeGroup.fillColor = mazeColor;
		mazeGroup.strokeColor = mazeColor;
		mazeGroup.closed = true;
		mazeGroup.shadowColor = mazeColor;
		mazeGroup.shadowBlur = blurVal;
		
		enterSegGroup.closed = true;
		enterSegGroup.shadowColor = mazeColor;
		enterSegGroup.shadowBlur = blurVal;
		enterSegGroup.fillColor = mazeColor;
		enterSegGroup.strokeColor = mazeColor;
		enterSegGroup.shadowColor = mazeColor;
		
		exitSegGroup.closed = true;
		exitSegGroup.fillColor = mazeColor;
		exitSegGroup.strokeColor = mazeColor;
		exitSegGroup.shadowColor = mazeColor;
		exitSegGroup.shadowBlur = blurVal;
		
		//Draw walls and rotate the wall into the correct position.
		for (var i=0;i<walls.length;i++){
			if(walls[i]==true){
				walls[i]=this.drawWall(this.segToRing(i),10,ringSep,ringThickness);
				walls[i].rotate(-(45/Math.pow(2,this.segToRing(i)))*(i-this.ringBorder(this.segToRing(i),true)),mazeCenter);
				mazeGroup.addChild(walls[i]);
			}
		}
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
		//arc1.shadowColor = mazeColor;
		//arc1.shadowBlur = 12;

		
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
		
		this.frm = new paper.Point(mazeCenter.x+(this.radius*Math.cos(this.frmAng)), mazeCenter.y+(this.radius*Math.sin(this.frmAng)));
		this.through = new paper.Point(mazeCenter.x+(this.radius*Math.cos(this.throughAng)), mazeCenter.y+(this.radius*Math.sin(this.throughAng)));
		this.to = new paper.Point(mazeCenter.x+(this.radius*Math.cos(this.toAng)),mazeCenter.y+(this.radius*Math.sin(this.toAng)));
		
		this.frm2 = new paper.Point(mazeCenter.x+((this.radius+this.thickness)*Math.cos(this.frmAng)), mazeCenter.y+((this.radius+this.thickness)*Math.sin(this.frmAng)));
		this.through2 = new paper.Point(mazeCenter.x+((this.radius+this.thickness)*Math.cos(this.throughAng)), mazeCenter.y+((this.radius+this.thickness)*Math.sin(this.throughAng)));
		this.to2 = new paper.Point(mazeCenter.x+((this.radius+this.thickness)*Math.cos(this.toAng)), mazeCenter.y+((this.radius+this.thickness)*Math.sin(this.toAng)));
		
		this.arc1 = new paper.Path.Arc(this.frm, this.through, this.to);
		this.arc2 = new paper.Path.Arc(this.to2, this.through2, this.frm2);
		
		this.arc1.join(this.arc2);
		this.arc1.closed = true;
		
		return this.arc1;
	}
	
	//Draw wall method (Ring number, thickness of wall, seperation of rings, thickness of rings)
	maze.prototype.drawWall = function(ringNum,thickness,ringSep,ringThickness){
		var rect = new paper.Rectangle(mazeCenter.x-(thickness/2),mazeCenter.y+(ringSep*ringNum),thickness,ringSep+ringThickness);
		var rectPath = new paper.Path.Rectangle(rect);
		rectPath.fillColor = mazeColor;
		rectPath.strokeColor = mazeColor;
		rectPath.selected = false;
		rectPath.shadowColor = mazeColor;
		rectPath.shadowBlur = blurVal;
		
		return rectPath;
	}

	//Rotate maze method. Goes through each part of the segments and wall arrays and if the spot is not blank,
	//rotates the path.
	maze.prototype.rotateMaze = function(speed){
		mazeGroup.rotate(speed,mazeCenter);
		//paintTrail.rotate(speed,mazeCenter);
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
	//Move the maze.
	maze.prototype.moveMaze = function(xPosDelt,yPosDelt){
		this.xPosDelt = xPosDelt;
		this.yPosDelt = yPosDelt;
		mazeGroup.position.x += this.xPosDelt;
		mazeGroup.position.y += this.yPosDelt;
		enterSegGroup.position.x += this.xPosDelt;
		enterSegGroup.position.y += this.yPosDelt;
		exitSegGroup.position.x += this.xPosDelt;
		exitSegGroup.position.y += this.yPosDelt;
		Core.position.x += this.xPosDelt;
		Core.position.y += this.yPosDelt;
		mazeCenter.x += this.xPosDelt;
		mazeCenter.y += this.yPosDelt;
	}
	maze.prototype.setMazePos = function(xPos,yPos){
		this.xPos = xPos;
		this.yPos = yPos;
		mazeGroup.position.x = this.xPos;
		mazeGroup.position.y = this.yPos;
		enterSegGroup.position.x = this.xPos;
		enterSegGroup.position.y = this.yPos;
		exitSegGroup.position.x = this.xPos;
		exitSegGroup.position.y = this.yPos;
		Core.position.x = this.xPos;
		Core.position.y = this.yPos;
		mazeCenter.x = this.xPos;
		mazeCenter.y = this.yPos;
	}

	maze.prototype.zoomMaze = function(zFactor){
		this.zFactor = zFactor;
		mazeGroup.scale(this.zFactor);
		enterSegGroup.scale(this.zFactor,mazeGroup.position);
		exitSegGroup.scale(this.zFactor,mazeGroup.position);
		Core.scale(this.zFactor,mazeGroup.position);
	}
	
}

var determineColor = function(){
	determineColor.prototype.detColor = function(){
		//Determine the maze color.
		if(currRings==1){
			mazeColor = levelOneColor;
			backColor = levelOneBackColor;
		}
		if(currRings==2){
			mazeColor = levelTwoColor;
			backColor = levelTwoBackColor;
		}
		if(currRings==3){
			mazeColor = levelThreeColor;
			backColor = levelThreeBackColor;
		}
		if(currRings==4){
			mazeColor = levelFourColor;
			backColor = levelFourBackColor;
		}
	}
}
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
	this.titleText;
	var ringCounter;
	
	
	//Draw UI
	UI.prototype.drawUI = function(){
		 
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
				//this.hiderSquare.strokeColor = mazeColor;
				this.hiderSquare.fillColor = mazeColor;
				//this.hiderSquare.strokeColor.brightness = Math.random();
				this.hiderSquare.fillColor.brightness = Math.random();
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
				//this.pixelToChange.strokeColor.brightness = 0.1;
			}else{
				this.pixelToChange.fillColor.brightness +=0.05;
				//this.pixelToChange.strokeColor.brightness +=0.05;
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
	UI.prototype.hiderPixelTransition = function(hiderPixel){
		this.hiderPixel = hiderPixel;
		if(this.isInTransition[this.hiderPixel.index] = false){
			
		}
	}
	UI.prototype.isHiderBelow0 = function(){
		if(this.hiderCount<=0){
			return true;
		}else{
			return false;
		}
	}
	UI.prototype.reduceHider = function(){
		this.hiderCount--;
		this.hider.scale(0.85);
	}
	UI.prototype.scaleHider = function(zFactor){
		this.zFactor = zFactor;
		this.hiderLayer.scale(this.zFactor);
	}
	UI.prototype.removeHider = function(){
		this.hiderLayer.remove();
	}
	UI.prototype.displayFPS = function(){
		this.FPStext.content = FPS;
	}
	UI.prototype.setHiderPos =  function(newPos){
		this.newPos = newPos;
		this.hiderLayer.position.y = this.newPos;
		//this.hiderLayer.position.y
	}
}

//Create lines that drop from the top. Lines dictates the number of lines that drop.
var backgroundLines = function(lines,seq,fire){
	this.lineNum = lines;
	this.seq = seq;
	this.fire = fire;
	this.lineArray = [];
	this.directionArray = [];
	this.speed = 10;
	this.activeInterval = 20;
	this.currTime = 0;
	this.nextLine = 0;
	this.zoomOutLinesActive=false;
	this.activeArray = [];
	this.offset = 0;
	this.chromat = true;
	this.freezeLines = false;
	
	backgroundLines.prototype.drawLine = function(lineIndex){
			this.line;
			this.randColor;
			this.lineIndex=lineIndex;
			this.xPos = (Math.random()*(paper.view.bounds.width/2))+(paper.view.bounds.width/4)+this.offset;
			this.frm = new paper.Point(this.xPos,-20);
			this.to = new paper.Point(this.xPos,-10);
			this.line = paper.Path.Line(this.frm,this.to);
			if(this.chromat){
				this.randColor = Math.floor(Math.random()*4);
				if(this.randColor == 0){
					this.line.strokeColor = levelOneBackColor;
					this.line.shadowColor = levelOneColor;
				}else{
					if(this.randColor == 1){
						this.line.strokeColor = levelTwoBackColor;
					    this.line.shadowColor = levelTwoColor;
					}else{
						if(this.randColor == 2){
							this.line.strokeColor = levelThreeBackColor;
						    this.line.shadowColor = levelThreeColor;
						}else{
							if(this.randColor == 3){
								this.line.strokeColor = levelFourBackColor;
								this.line.shadowColor = levelFourColor;
							}
						}
					}
				}
			}else{
				this.line.strokeColor = backColor;
				this.line.shadowColor = mazeColor;
			}
			this.line.shadowBlur = 12;
			this.line.strokeWidth = 5;
			this.line.strokeColor.alpha = 1;
			this.line.strokeCap = 'round';
			this.line.sendToBack();
			this.directionArray[this.lineIndex] = 'down';
			this.lineArray[this.lineIndex] = this.line;
			
	}
	
	//Each frame, check to see if we're at the proper interval. If so, delete the next line and redraw it.
	backgroundLines.prototype.activeLines = function(){
		if(this.currTime==this.activeInterval){
			this.currTime=0;
			if(this.lineArray[this.nextLine]!=null){
				this.clearLine(this.nextLine);
			}
			this.drawLine(this.nextLine);
			this.activeArray[this.nextLine]=true;
			if(this.nextLine==this.lineNum){
				this.nextLine=0;
			}else{
				this.nextLine++;
			}
		}
		this.currTime++;
	}
	//Fire this method once per frame.
	backgroundLines.prototype.pulseLines = function(){
		if(this.zoomOutLinesActive==false&&this.freezeLines==false){
			this.activeLines();
			for(i=0;i<this.lineNum;i++){
				if(this.activeArray[i]==true){
					this.extendLine(i);
				}
			}
		}
	}
	
	backgroundLines.prototype.extendLine = function(line){
		this.line = line;
		if(Math.random()>0.95){
			this.dir = Math.floor(Math.random()*5)
			if(this.dir==0){
				this.directionArray[this.line]='down';
			}
			if(this.dir==1&&this.directionArray[this.line]!='right'){
				this.directionArray[this.line]='left';
			}
			if(this.dir==2&&this.directionArray[this.line]!='left'){
				this.directionArray[this.line]='right';
			}
			if(this.dir==3){
				this.directionArray[this.line]='downright';
			}
			if(this.dir==4){
				this.directionArray[this.line]='downleft';
			}
		}
		if(this.directionArray[this.line]=='down'){
			this.lineArray[this.line].add(this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.x,this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.y+1*this.speed);
		}
		if(this.directionArray[this.line]=='left'){
			this.lineArray[this.line].add(this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.x-1*this.speed,this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.y);
		}
		if(this.directionArray[this.line]=='right'){
			this.lineArray[this.line].add(this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.x+1*this.speed,this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.y);
		}
		if(this.directionArray[this.line]=='downright'){
			this.lineArray[this.line].add(this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.x+1*this.speed,this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.y+1*this.speed);
		}
		if(this.directionArray[this.line]=='downleft'){
			this.lineArray[this.line].add(this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.x-1*this.speed,this.lineArray[this.line].segments[this.lineArray[this.line].segments.length-1].point.y+1*this.speed);
		}
		//Fade line
		this.lineArray[this.line].strokeColor.alpha = this.lineArray[this.line].strokeColor.alpha - 0.008; //.alpha = this.lineArray.strokeColor.alpha - 0.05;
	}
	
	backgroundLines.prototype.clearAllLines = function(){
		for(i=0;i<this.lineNum;i++){
			this.lineArray[i].remove();
			this.directionArray[i] = "";
		}
	}
	
	backgroundLines.prototype.freezeTheLines = function(){
		this.freezeLines = !this.freezeLines;
	}
	
	backgroundLines.prototype.clearLine = function(line){
		this.line = line;
		this.lineArray[this.line].remove();
		this.directionArray[this.line] = "";
	}
	
	backgroundLines.prototype.recolorLines = function(color,shadowColor){
		this.color = color;
		this.shadowColor = shadowColor;
		for(i=0;i<this.lineArray.length;i++){
			this.lineArray[i].strokeColor = this.color;
			this.lineArray[i].shadowColor = this.shadowColor;
		}
	}

	backgroundLines.prototype.paralaxLines = function(paraVal){
		this.paraVal = paraVal;
		for(i=0;i<this.lineArray.length;i++){
			this.lineArray[i].position.y = this.lineArray[i].position.y + this.paraVal;
		}
	}
	
	backgroundLines.prototype.zoomOutLines = function(zFactor){
		this.zoomOutLinesActive = true;
		this.zFactor = zFactor;
		for(i=0;i<this.lineArray.length;i++){
			this.lineArray[i].scale(this.zFactor,mazeGroup.position);
		}
	}

	backgroundLines.prototype.blankLines = function(){
		for(i=0;i<this.lineArray.length;i++){
			this.lineArray[i].strokeColor.alpha = 0;
			this.lineArray[i].shadowColor.alpha =0;
		}
	}
	
	backgroundLines.prototype.changeOffset = function(newOff){
		this.newOff = newOff;
		this.offset = this.newOff;
	}
	
	backgroundLines.prototype.toggleChromat = function(){
		this.chromat = !this.chromat;
	}
}

/**Text typer object. Given certain perameters, generate a text box.
frameDelay - how many frames each char of text should take to be drawn.
lineCount - how many lines long the text box should be.
baseCursorInt - how often the cursor should blink on and off.
boxX, boxY, boxWidth, boxHeight - define box dimentions.
**/
var textTyper = function(frameDelay,lineCount,baseCursorInt,boxX,boxY,boxWidth,boxHeight,boxWanted,fontSize,bold,justif,glow,cursorKill,hasCursor,textColor,textSep){
	this.horzPos = 0;
	this.vertPos = 0;
	this.boxX = boxX;
	this.boxY = boxY;
	this.boxWanted = boxWanted;
	this.boxWidth = boxWidth;
	this.boxHeight = boxHeight;
	this.fontSize = fontSize;
	this.bold = bold;
	this.typedText;
	this.frameDelay = frameDelay;
	this.lineCount = lineCount
	this.currentFrame = this.frameDelay;
	this.textCursor;
	this.readyForNextLine = true;
	this.textArray = [];
	this.numLines = lineCount;
	this.textToType = [];
	this.textBeingDrawn = '';
	this.baseCursorInt = baseCursorInt;
	this.cursorInt = this.baseCursorInt;
	this.justif = justif;
	this.glow = glow;
	this.cursorKill = cursorKill;
	this.hasCursor = hasCursor;
	this.textColor = textColor;
	this.cursorOffsetY = 0;
	this.cursorOffsetX = 0;
	this.textSep = textSep;
	
	
	if((typeof this.textSep)=='undefined'){
		this.textSep=20;
	}
	
	//Draw the box.
	if(boxWanted){
		this.upperRect = new paper.Path.Rectangle(this.boxX,this.boxY,this.boxWidth,this.boxHeight);
		this.upperRect.strokeColor = playerColor;
		this.upperRect.shadowColor = playerColor;
		this.upperRect.fillColor = 'black';
		this.upperRect.shadowBlur = 12;
		this.upperRect.strokeWidth = 3;
	}
	
	//Create the cursor
	this.textCursor = new paper.Path.Rectangle(-10000,-10000, this.fontSize/2, this.fontSize);
	if(this.hasCursor){
		this.textCursor.fillColor = 'red';
		this.textCursor.strokeColor = 'red';
		this.textCursor.shadowColor = playerColor;
		this.textCursor.shadowBlur = 12;
	}
	//Create the text block.
	for(i=0;i<this.lineCount;i++){
		this.textArray[i] = new paper.PointText(new paper.Point(this.boxX+14,this.boxY+this.textSep*i+25));
		this.textArray[i].fontFamily = 'VT323';
		this.textArray[i].fontSize = this.fontSize;
		this.textArray[i].fontWeight = this.bold;
		this.textArray[i].justification = this.justif;
		if(typeof this.textColor === 'undefined'){
			this.textArray[i].fillColor = playerColor;
		}else{
			this.textArray[i].fillColor = this.textColor;
		}
		if(this.glow){
			this.textArray[i].shadowColor = this.textArray[i].fillColor;
			this.textArray[i].shadowBlur = 12;
		}
	}
	
	
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
		
		//Determine if sound is still needed.
		if(!this.isDone()){
			this.requestOsdNoise();
		}else{
			
				this.ceaseOsdRequest();
		}
		
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
			this.textCursor.position = new paper.Point(this.boxX+7+this.horzPos*(this.fontSize/4)+this.cursorOffsetX,this.boxY+this.vertPos*this.fontSize+this.cursorOffsetY);
		}else{
			if(this.cursorKill&&(this.vertPos==this.lineCount)){
				this.textCursor.remove();
			}else{
				this.textCursor.position = new paper.Point(this.boxX+7+this.horzPos*(this.fontSize/4)+this.cursorOffsetX,this.boxY+this.vertPos*this.fontSize+this.cursorOffsetY);
				this.blinkCursor();
			}
		}
	}
	//Blink the cursor.
	textTyper.prototype.blinkCursor = function(interval){
		if(this.curSorKill==false){
			if(this.cursorInt == 0){
				this.cursorInt = this.baseCursorInt;
				if(this.textCursor.fillColor._canvasStyle=="rgb(0,0,0)"){
					this.textCursor.fillColor = "red";
					this.textCursor.strokeColor = "red";
				}else{
					this.textCursor.fillColor = 'black';
					this.textCursor.strokeColor = "black";
					this.textCursor.shadowBlur = 0;
				}
			}else{
				this.cursorInt--;
			}
		}
	}

	textTyper.prototype.moveTyper = function(xDelt,yDelt){
		this.xDelt = xDelt;
		this.yDelt = yDelt;
		if((typeof this.upperRect) != 'undefined'){
			this.upperRect.position.x = this.upperRect.position.x + this.xDelt;
			this.upperRect.position.y = this.upperRect.position.y + this.yDelt;
		}
		
		this.cursorOffsetX = this.xDelt;
		this.cursorOffsetY = this.yDelt;
		
		for(i=0;i<this.lineCount;i++){
			this.textArray[i].position.x = this.textArray[i].position.x + this.xDelt;
			this.textArray[i].position.y = this.textArray[i].position.y + this.yDelt;
		}
	}
	
	textTyper.prototype.recolorTyper = function(color){
		this.color = color;
		for(i=0;i<this.textArray.length;i++){
			this.textArray[i].fillColor = this.color;
			this.textArray[i].shadowColor = this.color;
		}
	}
	
	textTyper.prototype.isDone = function(){
		return (this.textBeingDrawn == 'NOMESSAGE');
	}
	
	textTyper.prototype.requestOsdNoise = function(){
		OSDNeeded = true;
	}
	
	textTyper.prototype.ceaseOsdRequest = function(){
		OSDNeeded = false;
	}
}

//Story manager. Reads gamestate and generates messages based of it.
var storyManager = function(theTyper,storyTyper,theAnimator){
	this.gameStart;
	this.roundWon;
	this.gameLoss;
	this.currRings;
	this.theAnimator = theAnimator;
	this.roundCount;
	this.theTyper = theTyper;
	this.storyTyper = storyTyper;
	this.vulnShown = false;
	this.currLevShown = false;
	this.startMessageShown = false;
	this.lossMessageShown = false;
	this.winMessageShown = false;
	this.chapterStoryMessages = [];
	for(i=10;i<70;i++){
		this.chapterStoryMessages[i] = false;
	}
	
	storyManager.prototype.readGameState = function(gameStart,roundWon,gameLoss,currRings,roundCount){
		this.gameStart = gameStart;
		this.roundWon = roundWon;
		this.gameLoss = gameLoss;
		this.currRings = currRings;
		this.roundCount = roundCount;
		this.chooseDataMessage();
		if(this.roundWon==true){
			this.chooseStoryMessage();
		}
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
		//Display current level.
		if(this.gameStart==false&&this.currLevShown==false&&!this.theAnimator.actTransitionActive&&!this.theAnimator.roundTransitionActive){
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
		if(currRings==1&&this.roundCount==0&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_0WinMessage();
		}
		if(currRings==1&&this.roundCount==1&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_1WinMessage();
		}
		if(currRings==1&&this.roundCount==2&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_2WinMessage();
		}
		if(currRings==1&&this.roundCount==3&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_3WinMessage();
		}
		if(currRings==1&&this.roundCount==4&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_4WinMessage();
		}
		if(currRings==1&&this.roundCount==5&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_5WinMessage();
		}
		if(currRings==1&&this.roundCount==6&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_6WinMessage();
		}
		if(currRings==1&&this.roundCount==7&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_7WinMessage();
		}
		if(currRings==1&&this.roundCount==8&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_8WinMessage();
		}
		if(currRings==1&&this.roundCount==9&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter1_9WinMessage();
		}
		if(currRings==2&&this.roundCount==0&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_0WinMessage();
		}
		if(currRings==2&&this.roundCount==1&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_1WinMessage();
		}
		if(currRings==2&&this.roundCount==2&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_2WinMessage();
		}
		if(currRings==2&&this.roundCount==3&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_3WinMessage();
		}
		if(currRings==2&&this.roundCount==4&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_4WinMessage();
		}
		if(currRings==2&&this.roundCount==5&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_5WinMessage();
		}
		if(currRings==2&&this.roundCount==6&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_6WinMessage();
		}
		if(currRings==2&&this.roundCount==7&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_7WinMessage();
		}
		if(currRings==2&&this.roundCount==8&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_8WinMessage();
		}
		if(currRings==2&&this.roundCount==9&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter2_9WinMessage();
		}
		if(currRings==3&&this.roundCount==0&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_0WinMessage();
		}
		if(currRings==3&&this.roundCount==1&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_1WinMessage();
		}
		if(currRings==3&&this.roundCount==2&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_2WinMessage();
		}
		if(currRings==3&&this.roundCount==3&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_3WinMessage();
		}
		if(currRings==3&&this.roundCount==4&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_4WinMessage();
		}
		if(currRings==3&&this.roundCount==5&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_5WinMessage();
		}
		if(currRings==3&&this.roundCount==6&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_6WinMessage();
		}
		if(currRings==3&&this.roundCount==7&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_7WinMessage();
		}
		if(currRings==3&&this.roundCount==8&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_8WinMessage();
		}
		if(currRings==3&&this.roundCount==9&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter3_9WinMessage();
		}
		if(currRings==4&&this.roundCount==0&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_0WinMessage();
		}
		if(currRings==4&&this.roundCount==1&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_1WinMessage();
		}
		if(currRings==4&&this.roundCount==2&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_2WinMessage();
		}
		if(currRings==4&&this.roundCount==3&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_3WinMessage();
		}
		if(currRings==4&&this.roundCount==4&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_4WinMessage();
		}
		if(currRings==4&&this.roundCount==5&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_5WinMessage();
		}
		if(currRings==4&&this.roundCount==6&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_6WinMessage();
		}
		if(currRings==4&&this.roundCount==7&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_7WinMessage();
		}
		if(currRings==4&&this.roundCount==8&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_8WinMessage();
		}
		if(currRings==4&&this.roundCount==9&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_9WinMessage();
		}
		if(currRings==4&&this.roundCount==10&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_10WinMessage();
		}
		if(currRings==4&&this.roundCount==11&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_11WinMessage();
		}
		if(currRings==4&&this.roundCount==12&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_12WinMessage();
		}
		if(currRings==4&&this.roundCount==13&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_13WinMessage();
		}
		if(currRings==4&&this.roundCount==14&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_14WinMessage();
		}
		if(currRings==4&&this.roundCount==15&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_15WinMessage();
		}
		if(currRings==4&&this.roundCount==16&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_16WinMessage();
		}
		if(currRings==4&&this.roundCount==17&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_17WinMessage();
		}
		if(currRings==4&&this.roundCount==18&&this.chapterStoryMessages[currRings*10+this.roundCount]==false){
			this.chapterStoryMessages[currRings*10+this.roundCount]=true;
			this.chapter4_18WinMessage();
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
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:RGrey@MiamiNow.com         ");
		this.storyTyper.passText("TO:MZir@MiamiNow.com           ");
		this.storyTyper.passText("SUBJ: Dead Programmer Article  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Looks good, go ahead and put   ");
		this.storyTyper.passText("it on the site.                ");
		this.storyTyper.passText("-Rod Grey, Editor - MiamiNow!  ");
		this.storyTyper.passText("-------------------------------");
		this.storyTyper.passText("LOCAL PROGRAMMER FOUND DEAD    ");
		this.storyTyper.passText("Maurice Zir - Reporter         ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Leon Garcia was found dead in  ");
		this.storyTyper.passText("his Miami Beach apartment this ");
		this.storyTyper.passText("morning. A coworker found      ");
		this.storyTyper.passText("Garcia's body after Garcia did ");
		this.storyTyper.passText("not show up to work for        ");
		this.storyTyper.passText("several weeks.                 ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Miami-Dade coroner Silas       ");
		this.storyTyper.passText("McManners said that Garcia died");
		this.storyTyper.passText("of a brain aneurysm.           ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("He leaves behind no family.    ");
	}
	storyManager.prototype.chapter1_1WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:BenEstates@HavenNet.com    ");
		this.storyTyper.passText("TO:MZir@MiamiNow.com           ");
		this.storyTyper.passText("SUBJ: YOU GOT PLAYED           ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("You think Leon died of a brain ");
		this.storyTyper.passText("aneurysm? I saw his body when  ");
		this.storyTyper.passText("I opened the door for his      ");
		this.storyTyper.passText("friend, and last I checked,    ");
		this.storyTyper.passText("brain aneurysms don't cause    ");
		this.storyTyper.passText("the poor dude's head to FRICKIN");
		this.storyTyper.passText("EXPLODE. Leon was a good guy   ");
		this.storyTyper.passText("and always paid his rent on    ");
		this.storyTyper.passText("time, so I don't know why the  ");
		this.storyTyper.passText("cops would lie about why he    ");
		this.storyTyper.passText("died. Come by and see the blood");
		this.storyTyper.passText("splattered apartment if you    ");
		this.storyTyper.passText("want to see the truth. I'll let");
		this.storyTyper.passText("you in.                        ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Ben                           ");
		this.storyTyper.passText(" Ben's Estates                 ");
	}
	storyManager.prototype.chapter1_2WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("INTERVIEW TRANSCRIPT           ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Zir: Do you agree with the     ");
		this.storyTyper.passText("coroner's assessment that      ");
		this.storyTyper.passText("Garcia died of a brain         ");
		this.storyTyper.passText("aneurysm?                      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Detective Morrow: The coroner  ");
		this.storyTyper.passText("is good at his job, I trust his");
		this.storyTyper.passText("judgement.                     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Z: But witnesses say his head  ");
		this.storyTyper.passText("had exploded.                  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("M: Well, yes. I'm guessing he  ");
		this.storyTyper.passText("must have had a bad case of it.");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Z: Do you think this could have");
		this.storyTyper.passText("had anything to do with the    ");
		this.storyTyper.passText("headrig he was -               ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("M: Look, I've got to go. Direct");
		this.storyTyper.passText("further questions to my office.");
		
	}
	storyManager.prototype.chapter1_3WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:торговец@могила.ru         ");
		this.storyTyper.passText("TO:MZir@MiamiNow.com           ");
		this.storyTyper.passText("SUBJ: that rig                 ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("From the pictures you sent me  ");
		this.storyTyper.passText("of the rig that programmer was ");
		this.storyTyper.passText("wearing, I can say that this is");
		this.storyTyper.passText("not something that's available ");
		this.storyTyper.passText("on the general market. It's    ");
		this.storyTyper.passText("HaveNet design, but it         ");
		this.storyTyper.passText("interfaces with the whole      ");
		this.storyTyper.passText("brain, rather than just the    ");
		this.storyTyper.passText("frontal lobe, as other models  ");
		this.storyTyper.passText("do.                            ");
		this.storyTyper.passText("Also interesting: when         ");
		this.storyTyper.passText("it/Garcia's head exploded, the ");
		this.storyTyper.passText("rig split perfectly down the   ");
		this.storyTyper.passText("middle into two halves.        ");
		this.storyTyper.passText("Strange.                       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Keep me posted,                ");
		this.storyTyper.passText("Proda                          ");
	}
	storyManager.prototype.chapter1_4WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:GETLOST315@HaveNet.com     ");
		this.storyTyper.passText("TO:MZir@MiamiNow.com           ");
		this.storyTyper.passText("SUBJ:GET LOST                  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("HEY MAURICE,                   ");
		this.storyTyper.passText("IF YOU KNOW WHAT'S GOOD FOR YOU");
		this.storyTyper.passText("AND YOUR FAMILY, YOU'LL FORGET ");
		this.storyTyper.passText("LEON GARCIA EVER EXISTED.      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("THIS IS YOUR ONLY WARNING.     ");

	}
	storyManager.prototype.chapter1_5WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:MZir@MiamiNow.com          ");
		this.storyTyper.passText("TO:RGrey@MiamiNow.com          ");
		this.storyTyper.passText("SUBJ: Police ignoring threat   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Does our budget allow for      ");
		this.storyTyper.passText("MiamiNow to hire bodyguards? I ");
		this.storyTyper.passText("want to keep digging on the    ");
		this.storyTyper.passText("Garcia story, but the police   ");
		this.storyTyper.passText("say there is nothing to be done");
		this.storyTyper.passText("about a threatening email.     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Maurice                       ");

	}
	storyManager.prototype.chapter1_6WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:RGrey@MiamiNow.com         ");
		this.storyTyper.passText("TO:MZir@MiamiNow.com           ");
		this.storyTyper.passText("SUBJ: Dead Guy Follow Up       ");
		this.storyTyper.passText("Edited the article, go ahead   ");
		this.storyTyper.passText("and upload it.                 ");
		this.storyTyper.passText("-Rod Grey, Editor - MiamiNow!  ");
		this.storyTyper.passText("-------------------------------");
		this.storyTyper.passText("QUESTIONS LINGER ABOUT DEAD    ");
		this.storyTyper.passText("PROGRAMMER                     ");
		this.storyTyper.passText("Maurice Zir - Reporter         ");
		this.storyTyper.passText("The details behind the recent  ");
		this.storyTyper.passText("death of Leon Garcia linger.   ");
		this.storyTyper.passText("While the county coroner ruled ");
		this.storyTyper.passText("the death to be a brain        ");
		this.storyTyper.passText("aneurysm, witnesses report that");
		this.storyTyper.passText("Garcia's entire head was       ");
		this.storyTyper.passText("missing. The appartment was    ");
		this.storyTyper.passText("coated in a layer of blood,    ");
		this.storyTyper.passText("bone, and brains, as if his    ");
		this.storyTyper.passText("head had exploded. Also, what  ");
		this.storyTyper.passText("appears to be a prototype      ");
		this.storyTyper.passText("HaveNet headrig was found at   ");
		this.storyTyper.passText("...                            ");
	}
	storyManager.prototype.chapter1_7WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:торговец@могила.ru         ");
		this.storyTyper.passText("TO:MZir@MiamiNow.com           ");
		this.storyTyper.passText("SUBJ:Miami Police Node         ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("If you want answers, they're   ");
		this.storyTyper.passText("likely in the police records.  ");
		this.storyTyper.passText("I did some digging and found   ");
		this.storyTyper.passText("the digital entrance to        ");
		this.storyTyper.passText("Miami's Central Records Bureau.");
		this.storyTyper.passText("I've attached the info to this ");
		this.storyTyper.passText("file.                          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("If you want me to hack it,     ");
		this.storyTyper.passText("It'll cost you. You don't need ");
		this.storyTyper.passText("to decide right away, and until");
		this.storyTyper.passText("then take this attachment and  ");
		this.storyTyper.passText("store it in the most secure    ");
		this.storyTyper.passText("place on your server.          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("смутьян                        ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("[ATTACHMENT NOT FOUND - FILE   ");
		this.storyTyper.passText("MOVED]                         ");
	}
	storyManager.prototype.chapter1_8WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:RGrey@MiamiNow.com         ");
		this.storyTyper.passText("TO:Employees@MiamiNow.com      ");
		this.storyTyper.passText("SUBJ:Maurice Zir Memorial      ");
		this.storyTyper.passText("Office Party                   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Hey all,                       ");
		this.storyTyper.passText("I know we're all saddened by   ");
		this.storyTyper.passText("Maurice's sudden passing, but  ");
		this.storyTyper.passText("Detective Morrow says they're  ");
		this.storyTyper.passText("sure to find who was driving   ");
		this.storyTyper.passText("that van. To lighten everyone's");
		this.storyTyper.passText("spirits, we'll be having an    ");
		this.storyTyper.passText("office party in his memory.    ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Steve, make sure you bring     ");
		this.storyTyper.passText("those sandwiches we all love   ");
		this.storyTyper.passText("so much. Everyone else respond ");
		this.storyTyper.passText("with what you're bringing to   ");
		this.storyTyper.passText("the party.                     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Rod Grey, Editor - MiamiNow!  ");
	}
	storyManager.prototype.chapter1_9WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("NODE DETAILS                   ");
		this.storyTyper.passText("NODE NAME: CENTRAL RECORDS     ");
		this.storyTyper.passText("BUREAU                         ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE ENTRANCE ADDRESS:         ");
		this.storyTyper.passText("5023:0a18:22ab:0213:0020:0020: ");
		this.storyTyper.passText("4d9e:a12b                      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE GEOLOCATION:              ");
		this.storyTyper.passText("9105 NW 25 STREET, MIAMI,      ");
		this.storyTyper.passText("FLORIDA.                       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE OWNER:                    ");
		this.storyTyper.passText("CITY OF MIAMI                  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE SECURITY: CLASS 2         ");

	}
	storyManager.prototype.chapter2_0WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("--------MIAMI POLICE LOG-------");
		this.storyTyper.passText("On Tuesday, September 8th, 2060");
		this.storyTyper.passText("I, Officer Luis Malcolm was    ");
		this.storyTyper.passText("dispatched to 706 Coconut Grove");
		this.storyTyper.passText("to investigate a possible      ");
		this.storyTyper.passText("homicide. I met with Ben Latt, ");
		this.storyTyper.passText("the landlord.                  ");
		this.storyTyper.passText("Identification of the victim   ");
		this.storyTyper.passText("was nontrivial, as his head    ");
		this.storyTyper.passText("was no longer attached to his  ");
		this.storyTyper.passText("body. The head itself was      ");
		this.storyTyper.passText("reduced to a variety of skull, ");
		this.storyTyper.passText("blood, bone, and brain matter. ");
		this.storyTyper.passText("These were sprayed out across  ");
		this.storyTyper.passText("the apartment in a circular    ");
		this.storyTyper.passText("distribution, centering on     ");
		this.storyTyper.passText("the victim's corpse.           ");
		this.storyTyper.passText("A damaged headrig was found    ");
		this.storyTyper.passText("among the gore. The headrig    ");
		this.storyTyper.passText("appears to have split down the ");
		this.storyTyper.passText("middle.                        ");
	}
	storyManager.prototype.chapter2_1WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:QRENO@MiamiPol.gov         ");
		this.storyTyper.passText("TO:DMORROW@MiamiPol.gov        ");
		this.storyTyper.passText("Subj: Leon's Headrig           ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Yeah, I've never heard of a    ");
		this.storyTyper.passText("headrig to cause someone's     ");
		this.storyTyper.passText("head to actually explode. The  ");
		this.storyTyper.passText("old models from the 2040's     ");
		this.storyTyper.passText("could fry your brain if a surge");
		this.storyTyper.passText("hit, but never something this  ");
		this.storyTyper.passText("extreme. It's definitely       ");
		this.storyTyper.passText("HaveNet design, though the rig ");
		this.storyTyper.passText("is an unmarked prototype.      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Quen                          ");

	}
	storyManager.prototype.chapter2_2WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("TO:PR@HaveNet.com              ");
		this.storyTyper.passText("FRM:DMORROW@MiamiPol.gov       ");
		this.storyTyper.passText("SUBJ:Looking for info on Leon  ");
		this.storyTyper.passText("Garcia                         ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("HaveNet,                       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("I'm Detective Morrow with the  ");
		this.storyTyper.passText("Miami Police Department, I was ");
		this.storyTyper.passText("wondering if you could give us ");
		this.storyTyper.passText("any information you have on    ");
		this.storyTyper.passText("the recently deceased Leon     ");
		this.storyTyper.passText("Garcia, as well as this        ");
		this.storyTyper.passText("prototype headrig we found in  ");
		this.storyTyper.passText("his appartment.                ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Detective Morrow              ");

	}
	storyManager.prototype.chapter2_3WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:TheRosato@HaveNet.com      ");
		this.storyTyper.passText("TO:DMORROW@MiamiPol.gov        ");
		this.storyTyper.passText("SUBJ:Garcia Investigation      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Detective,                     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("We will be subcontracting the  ");
		this.storyTyper.passText("Garcia investigation to HaveNet");
		this.storyTyper.passText("starting now. You will turn the");
		this.storyTyper.passText("FB3 prototype headrig remains  ");
		this.storyTyper.passText("over to them. This matter is   ");
		this.storyTyper.passText("classified, so you may not     ");
		this.storyTyper.passText("reveal HaveNet's involvement   ");
		this.storyTyper.passText("with the case.                 ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Sincerely,                     ");
		this.storyTyper.passText("Vice Mayor Rosato              ");

	}
	storyManager.prototype.chapter2_4WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:TheRosato@HaveNet.com      ");
		this.storyTyper.passText("TO:DMORROW@MiamiPol.com        ");
		this.storyTyper.passText("SUBJ:Problematic Reporter      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Maurice Zir from MiamiNow is   ");
		this.storyTyper.passText("continuing to investigate the  ");
		this.storyTyper.passText("Leon Garcia case. This is in   ");
		this.storyTyper.passText("violation of HaveNet's         ");
		this.storyTyper.passText("Exclusive Investigation        ");
		this.storyTyper.passText("Contract. Since this contract  ");
		this.storyTyper.passText("is classified, you'll need to  ");
		this.storyTyper.passText("head him off by other means.   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Sincerely,                     ");
		this.storyTyper.passText("Vice Mayor Rosato              ");
	}
	storyManager.prototype.chapter2_5WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:noReply@HaveNet.com        ");
		this.storyTyper.passText("TO:DMORROW@MiamiPol.gov        ");
		this.storyTyper.passText("SUBJ:Account Registered!       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Your new HaveNet account,      ");
		this.storyTyper.passText("GETLOST315, has been           ");
		this.storyTyper.passText("registered!                    ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Have fun, and thank you for    ");
		this.storyTyper.passText("choosing HaveNet!              ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("The HaveNet Family             ");
		this.storyTyper.passText("(Which includes you now, too!) ");
	}
	storyManager.prototype.chapter2_6WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:TheRosato@HaveNet.com      ");
		this.storyTyper.passText("TO:DMORROW@MiamiPol.gov        ");
		this.storyTyper.passText("SUBJ:Disapointed at your       ");
		this.storyTyper.passText("incompetance                   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Detective,                     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Maurice Zir published a        ");
		this.storyTyper.passText("follow-up article on the       ");
		this.storyTyper.passText("MiamiNow website, which is in  ");
		this.storyTyper.passText("direct violation of our        ");
		this.storyTyper.passText("classified contract with       ");
		this.storyTyper.passText("HaveNet. Ensure this does not  ");
		this.storyTyper.passText("happen again, or you and your  ");
		this.storyTyper.passText("family will be dealt with.     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Sincerely,                     ");
		this.storyTyper.passText("Vice Mayor Rosato              ");
	}
	storyManager.prototype.chapter2_7WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:DMORROW@MiamiPol.gov       ");
		this.storyTyper.passText("TO:TheRosato@HaveNet.com       ");
		this.storyTyper.passText("SUBJ: It is done.              ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Morrow                        ");
	}
	storyManager.prototype.chapter2_8WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:DMORROW@MiamiPol.gov       ");
		this.storyTyper.passText("TO:QRENO@MiamiPol.gov          ");
		this.storyTyper.passText("SUBJ:I feel sick               ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("I know you read my emails,     ");
		this.storyTyper.passText("Quen, so you know what I've    ");
		this.storyTyper.passText("been through. Going through.   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("I want to nail these bastards  ");
		this.storyTyper.passText("to the wall, but I don't have  ");
		this.storyTyper.passText("enough. I know you don't owe   ");
		this.storyTyper.passText("me, but can you get me into    ");
		this.storyTyper.passText("HaveNet's Miami based server?  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Morrow                        ");
	}
	storyManager.prototype.chapter2_9WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:QRENO@MiamiPol.gov         ");
		this.storyTyper.passText("TO:DMORROW@MiamiPol.gov        ");
		this.storyTyper.passText("SUBJ:NO SUBJECT                ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("I can't get you all the way,   ");
		this.storyTyper.passText("but I can get you in through   ");
		this.storyTyper.passText("the law enforcement backdoor.  ");
		this.storyTyper.passText("-Q                             ");
		this.storyTyper.passText("NODE DETAILS                   ");
		this.storyTyper.passText("NODE NAME: HAVENET MIAMI CAMPUS");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE ENTRANCE ADDRESS:         ");
		this.storyTyper.passText("1422:2b20:31da:1431:0310:0310: ");
		this.storyTyper.passText("9e1e:52cb                      ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE GEOLOCATION:              ");
		this.storyTyper.passText("100 ROSATO BLVD, MIAMI, FLORIDA");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE OWNER:                    ");
		this.storyTyper.passText("HEVENET INCORPORATED           ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE SECURITY: CLASS 3         ");
	}
	storyManager.prototype.chapter3_0WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("Research Log - Dr.Fen          ");
		this.storyTyper.passText("Good news and bad news: The    ");
		this.storyTyper.passText("good news is that, after a long");
		this.storyTyper.passText("programming binge, Garcia got  ");
		this.storyTyper.passText("the distributed node up and    ");
		this.storyTyper.passText("running. The bad is that he    ");
		this.storyTyper.passText("died shortly after the thing   ");
		this.storyTyper.passText("onlined, so we have no ability ");
		this.storyTyper.passText("to access it.                  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("I'm also not sure why the node ");
		this.storyTyper.passText("is so large. It was only       ");
		this.storyTyper.passText("supposed to function across    ");
		this.storyTyper.passText("five different nodes, but from ");
		this.storyTyper.passText("what the analytics guys are    ");
		this.storyTyper.passText("telling me, the thing is spread");
		this.storyTyper.passText("out over five hundred.         ");
		this.storyTyper.passText("We're capirit in our systems   ");
		this.storyTyper.passText("We're calling this the 'Phantom");
		this.storyTyper.passText("Node' until we can figure out  ");
		this.storyTyper.passText("how to get at it.              ");

	}
	storyManager.prototype.chapter3_1WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:LDeen@HaveNet.com          ");
		this.storyTyper.passText("TO:TheRosato@HaveNet.com       ");
		this.storyTyper.passText("SUBJ: Need Exclusivity for     ");
		this.storyTyper.passText("Garcia case                    ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Mr.Rosato,                     ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("HaveNet requests a confidential");
		this.storyTyper.passText("and exclusive investigation    ");
		this.storyTyper.passText("contract for the Leon Garcia   ");
		this.storyTyper.passText("case. In return, we are willing");
		this.storyTyper.passText("to make a significant and      ");
		this.storyTyper.passText("unrelated donation to your     ");
		this.storyTyper.passText("campaign for mayor. All we ask ");
		this.storyTyper.passText("is that you keep any police or ");
		this.storyTyper.passText("reporters away from the Leon   ");
		this.storyTyper.passText("Garcia case.                   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Lee Deen                       ");
		this.storyTyper.passText("HaveNet Regional Director      ");
	}
	storyManager.prototype.chapter3_2WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("Research Log - Dr.Fen          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("The Phantom Node appears to be ");
		this.storyTyper.passText("spreading to more systems. On  ");
		this.storyTyper.passText("one hand, the more systems it's");
		this.storyTyper.passText("on means less load per system, ");
		this.storyTyper.passText("so our central node is finally ");
		this.storyTyper.passText("starting to become usable      ");
		this.storyTyper.passText("again.                         ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("On the other hand, it's moving ");
		this.storyTyper.passText("on to systems we don't own.    ");
		this.storyTyper.passText("Analytics says it has spread   ");
		this.storyTyper.passText("to all sorts of devices all    ");
		this.storyTyper.passText("over the city. The Phantom Node");
		this.storyTyper.passText("is running on car nodes,       ");
		this.storyTyper.passText("cell nodes, they even found it ");
		this.storyTyper.passText("on some lady's automatic       ");
		this.storyTyper.passText("toaster oven.                  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("If this gets out, heads will   ");
		this.storyTyper.passText("roll.                          ");
	}
	storyManager.prototype.chapter3_3WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("Research Log - Dr.Fen          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("So, my subordinates are telling");
		this.storyTyper.passText("me they've mapped out the      ");
		this.storyTyper.passText("Phantom Node as best they can, ");
		this.storyTyper.passText("and it appears to resemble a   ");
		this.storyTyper.passText("human brain.                   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("While we certainly have enough ");
		this.storyTyper.passText("computing power to model a mind");
		this.storyTyper.passText("the issue has always been      ");
		this.storyTyper.passText("actually programming the thing.");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("How did Garcia do it?          ");
	}
	storyManager.prototype.chapter3_4WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("Research Log - Dr.Fen          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Containment on the Phantom Node");
		this.storyTyper.passText("is going well, although our    ");
		this.storyTyper.passText("repair teams have been working ");
		this.storyTyper.passText("around the clock to collect    ");
		this.storyTyper.passText("all the contaminated devices.  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("For some reason, only half of  ");
		this.storyTyper.passText("the Phantom Node is expanding. ");
		this.storyTyper.passText("The other half appears inert.  ");
		this.storyTyper.passText("As such, we've only had to     ");
		this.storyTyper.passText("quarantine the active half,    ");
		this.storyTyper.passText("and leave the Inert Half alone.");
		this.storyTyper.passText("Real time saver for an already ");
		this.storyTyper.passText("busy schedule.                 ");
	}
	storyManager.prototype.chapter3_5WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("Research Log - Dr.Fen          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("The Phantom Node is Garcia.    ");
		this.storyTyper.passText("He used the prototype headrig  ");
		this.storyTyper.passText("to scan his brain, synchronize ");
		this.storyTyper.passText("it with a distributed node, but");
		this.storyTyper.passText("something went wrong.          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Is this thing actually him? Or ");
		this.storyTyper.passText("is it a copy or bastardization?");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("I don't know. I'm not even sure");
		this.storyTyper.passText("how to communicate with it.    ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("With him.                      ");
	}
	storyManager.prototype.chapter3_6WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:YLANNIGAN@HaveNet.com      ");
		this.storyTyper.passText("TO:RFEN@HaveNet.com            ");
		this.storyTyper.passText("SUBJ:Headrig Analysis          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Dr.Fen,                        ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("After a detailed analysis of   ");
		this.storyTyper.passText("the FB3 prototype headrig      ");
		this.storyTyper.passText("Garcia was using, I have a     ");
		this.storyTyper.passText("hypothesis as to why there are ");
		this.storyTyper.passText("'Inert' and 'Active' halves of ");
		this.storyTyper.passText("the Phantom Node. When the     ");
		this.storyTyper.passText("feedback from the brain/machine");
		this.storyTyper.passText("synchronization caused Garcia's");
		this.storyTyper.passText("brain to disintegrate, it      ");
		this.storyTyper.passText("caused the headrig to split in ");
		this.storyTyper.passText("half. For whatever reason, only");
		this.storyTyper.passText("one hemisphere transferred     ");
		this.storyTyper.passText("properly. The other hemisphere ");
		this.storyTyper.passText("did transfer, but in a damaged ");
		this.storyTyper.passText("state. Thus, it's inert.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-Lannigan                      ");
	}
	storyManager.prototype.chapter3_7WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:TURO@HaveNet.com           ");
		this.storyTyper.passText("TO:RFED@HaveNet.com            ");
		this.storyTyper.passText("SUBJ:Inert Half healing?       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Call me crazy, but the damaged ");
		this.storyTyper.passText("'Inert' half of the Phantom    ");
		this.storyTyper.passText("node has been showing activity ");
		this.storyTyper.passText("these past few days. It's not  ");
		this.storyTyper.passText("aggressively co-opting systems ");
		this.storyTyper.passText("like the active half was, but  ");
		this.storyTyper.passText("if it does learn to navigate   ");
		this.storyTyper.passText("the net the same way the other ");
		this.storyTyper.passText("half did, we might have to do  ");
		this.storyTyper.passText("more containment.              ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Also, if the two halves manage ");
		this.storyTyper.passText("to establish communication,    ");
		this.storyTyper.passText("there might be no stopping     ");
		this.storyTyper.passText("them.                          ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("-T                             ");
	}
	storyManager.prototype.chapter3_8WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:TURO@HaveNet.com           ");
		this.storyTyper.passText("TO:RFEN@HaveNet.com            ");
		this.storyTyper.passText("SUBJ: The Inert Half is awake  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("Hey, you know the half of the  ");
		this.storyTyper.passText("Phantom Node that seems 'inert'");
		this.storyTyper.passText("and uncommunicative? It's been ");
		this.storyTyper.passText("going crazy the past half-hour.");
		this.storyTyper.passText("The Inert Half just tore       ");
		this.storyTyper.passText("through our systems, the Miami ");
		this.storyTyper.passText("Police's Records node, and     ");
		this.storyTyper.passText("the MiamiNow news node. If     ");
		this.storyTyper.passText("we're going to contain it, we  ");
		this.storyTyper.passText("need to move fast. I contained ");
		this.storyTyper.passText("the active part of the node    ");
		this.storyTyper.passText("to the DataVault. If the inert ");
		this.storyTyper.passText("half wants to rejoin the active");
		this.storyTyper.passText("half, it's going to have to    ");
		this.storyTyper.passText("get through that.              ");
		this.storyTyper.passText("-T                             ");		
	}
	storyManager.prototype.chapter3_9WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("NODE DETAILS                   ");
		this.storyTyper.passText("NODE NAME: HAVENET DATA VAULT  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE ENTRANCE ADDRESS:         ");
		this.storyTyper.passText("waef3n2:12g83nqaa:39aew9z:aw34 ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE GEOLOCATION:              ");
		this.storyTyper.passText("UNKNOWN                        ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE OWNER:                    ");
		this.storyTyper.passText("UNKNOWN                        ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("NODE SECURITY: CLASS 4         ");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("           I AM HERE.          ");
		this.storyTyper.passText("           I AM HERE.          ");
	}
	storyManager.prototype.chapter4_0WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 5%  ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_1WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 10% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_2WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 15% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_3WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 20% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_4WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 25% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_5WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 30% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_6WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 35% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_7WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 40% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_8WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 45% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_9WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 50% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_10WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 55% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_11WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 60% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_12WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 65% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_13WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 70% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_14WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 75% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_15WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 80% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_16WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 85% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_17WinMessage = function(){
	this.storyTyper.passText("ACTION:CLEAR");
	this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
	this.storyTyper.passText("TO:TURO@Havenet.com            ");
	this.storyTyper.passText("SUBJ:WARNING                   ");
	this.storyTyper.passText("ATTENTION:                     ");
	this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AN UNKNOWN USER IS             ");
	this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 90% ");
	this.storyTyper.passText("                               ");
	this.storyTyper.passText("AUTOSEC                        ");
	this.storyTyper.passText("(DO NOT REPLY)                 ");
	}
	storyManager.prototype.chapter4_18WinMessage = function(){
		this.storyTyper.passText("ACTION:CLEAR");
		this.storyTyper.passText("FRM:AUTOSEC@Havenet.com        ");
		this.storyTyper.passText("TO:TURO@Havenet.com            ");
		this.storyTyper.passText("SUBJ:WARNING                   ");
		this.storyTyper.passText("ATTENTION:                     ");
		this.storyTyper.passText("DATAVAULT BREACH IN PROGRESS   ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AN UNKNOWN USER IS             ");
		this.storyTyper.passText("ACCESSING THE DATAVAULT.       ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("ESTIMATED BREACH PROGRESS: 95% ");
		this.storyTyper.passText("                               ");
		this.storyTyper.passText("AUTOSEC                        ");
		this.storyTyper.passText("(DO NOT REPLY)                 ");
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
	playerSphere.prototype.insideMazeAbsolute = function(){
		if(((player.position).getDistance(mazeCenter))<(ringSep*(currRings+1)+ringThickness)){
			return true;
		}else{
			return false;
		}
	}
	playerSphere.prototype.insideVault = function(){
		return (((player.position).getDistance(mazeCenter))<ringSep);
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
	}
	screenShaker.prototype.shake = function(){
		if(this.shakeTime > 0){
			this.shakeTime--;
			if(this.firstShake==true||this.shakeTime==0){
				paper.view.translate(0,this.yShake*0.5);
				this.firstShake=false;
			}else{
				paper.view.translate(0,this.yShake);
			}
			this.yShake = this.yShake*(-1);
		}else{
			this.firstShake=true;
		}
	}
}

var transitionAnimations = function(maze,backSq,backLns,UIObj,theHelpButton,soundMan){
	this.backSq = backSq;
	this.backLns = backLns;
	this.UIObj = UIObj;
	this.theHelpButton = theHelpButton;
	this.soundMan = soundMan;
	this.roundTransitionActive = false;
	this.introActive = false;
	this.playIntroActive = false;
	this.actTransitionActive = false;
	this.roundTransitionActive = false;
	this.beginButtonStage=0
	this.actMazeRevealActive = false;
	this.outroActive = false;
	this.pointerToBallActive = false;
	this.beginButtonAnimationActive = false;
	this.beginButtonAnimationRActive = false;
	this.ballToPointerActive = false;
	this.coreGrabActive = false;
	this.exitRevealActive = false;
	this.enteranceSealActive = false;
	this.playerKillActive = false;
	this.theMaze = maze;
	this.winText = new paper.PointText((new paper.Point(paper.view.center.x-35,paper.view.center.y)));
	this.winText.fillColor = 'red';
	this.winText.fontSize = 50;
	this.winText.font = 'VT323';
	this.winText.shadowColor = 'red';
	this.winText.shadowBlur = 12;
	this.winTextContent = "FILE RETRIEVED."
	this.winText.fontWeight = 'bold';
	this.winTextHorzPos = 0;
	this.winTextTypeDelay = 5;
	this.winTextFrame = 0;
	this.winWhiteFlashDuration = 5;
	this.winWhiteFlashFrame = 0;
	this.beginButtonRStage=0;
	this.actZoomOutDuration = 60;
	this.actZoomOutFrame = 0;
	this.isWhite = false;
	this.beginLit = false;
	
	this.menuRevealStage = 0
	this.actMazeRevStage = 0
	
	this.disconHangTime = 60;
	this.disconHangFrame = 0;
	
	this.connectingServerDotMode = 0;
	this.dotTime = 0;
	this.dotTimeDelay = 120;
	
	this.serverNodeText = new paper.PointText((new paper.Point(paper.view.center.x,paper.view.center.y-70)));
	this.serverNodeTextContent = 'ACCESSING NODE:';
	this.serverNodeText.fillColor = 'red';
	this.serverNodeText.fontSize = 50;
	this.serverNodeText.fontWeight = 'bold'
	this.serverNodeText.font = 'VT323';
	this.serverNodeText.shadowColor = playerColor;
	this.serverNodeText.shadowBlur = 12;
	this.disconText = new paper.PointText((new paper.Point(paper.view.center.x,paper.view.center.y-70)));
	this.disconTextContent = 'DISCONNECTED FROM:';
	this.disconText.fillColor = 'red';
	this.disconText.fontSize = 50;
	this.disconText.fontWeight = 'bold'
	this.disconText.font = 'VT323';
	this.disconText.shadowColor = playerColor;
	this.disconText.shadowBlur = 12;
	this.disconServerText = new paper.PointText((new paper.Point(paper.view.center.x,paper.view.center.y)));
	this.disconServerText.fillColor = 'red';
	this.disconServerText.fontSize = 50;
	this.disconServerText.fontWeight = 'bold'
	this.disconServerText.font = 'VT323';
	this.disconServerText.shadowColor = playerColor;
	this.disconServerText.shadowBlur = 12;
	this.serverText = new paper.PointText((new paper.Point(paper.view.center.x,paper.view.center.y)));
	this.serverText.fillColor = 'red';
	this.serverText.fontSize = 50;
	this.serverText.font = 'VT323';
	this.serverText.fontWeight = 'bold';
	this.serverText.shadowColor = playerColor;
	this.serverText.shadowBlur = 12;
	this.serverTextTypeDelay = 3;
	this.serverTextFrame = 0;
	this.serverTextHorzPos = 0;
	this.creditText;
	this.startText;
	this.startTextBox;
	this.menuRevealActive = false;
	this.finaleRoundTransitionActive = false;
	this.finaleRoundStage=0;
	this.finaleZoomMazeDuration = 30;
	this.finaleZoomMazeFrame = 0;
	this.finalCoreAnimationActive = false;
	this.finalCoreAnimationStage = 0;
	this.bishopAnimationActive = false;
	this.bishopAnimationRActive = false;
	this.nowtroAnimationActive = false;
	this.nowtroAnimationRActive = false;
	this.nowtroStage = 0;
	this.nowtroRStage = 0;
	this.enteranceRevealActive = false;
	this.enteranceRevealStage=0;
	
	this.outroTextChop = 0;
	this.enteranceSealStage=0;
	
	this.introDelay=60;
	this.introDelayFrame=0;
	this.outroStage = 0;
	this.bishopStage = 0;
	this.bishopRStage = 0;
	this.musicCreditText;
	this.bishopBox;
	this.nowtroBox;
	this.droidLit = false;
	this.nowtroLit = false;
	this.outroText;
	this.outroText2;
	this.thirtyDelay = 30;
	this.thirtyDelayFrame = 0;
	
	this.zoomCount=0;
	this.introStage = 0;
	
	this.titleText;
	this.introText2;
	
	this.roundTransStage = 0;
	this.ActTransStage=0;
	
	this.helpButtonLightAnimationActive = false;
	this.helpButtonLightAnimationRActive = false;
	this.helpButtonLit = false;
	
	this.helpTextRevealActive = false;
	this.helpTextStage = 0;
	
	this.helpTextHideAnimationActive = false;
	this.helpTextHideStage = 0;
	
	/**
	Animation structure:
	Check if the animation should be playing.
	-If so, advance the animation to the next frame.
	-If not, make the animation inactive.
	**/
	
	transitionAnimations.prototype.displayMenu = function(){
		this.menuRevealActive = true;
	}
	transitionAnimations.prototype.playIntro = function(){
		this.playIntroActive = true;
	}
	transitionAnimations.prototype.playActTransition = function(){
		this.actTransitionActive = true;
	}
	transitionAnimations.prototype.playActMazeReveal = function(){
		this.actMazeRevealActive = true;
	}
	transitionAnimations.prototype.playRoundTransition = function(){
		this.roundTransitionActive = true;
	}
	transitionAnimations.prototype.playOutro = function(){
		this.outroActive = true;
	}
	transitionAnimations.prototype.playPointerToBall = function(){
		this.pointerToBallActive = true;
	}
	transitionAnimations.prototype.playBalltoPointer = function(){
		this.ballToPointerActive = true;
	}
	transitionAnimations.prototype.playCoreGrab = function(){
		this.coreGrabActive = true;
	}
	transitionAnimations.prototype.playExitReveal = function(){
		this.exitRevealActive = true;
	}
	transitionAnimations.prototype.playEnteranceSeal = function(){
		this.enteranceSealActive = true;
	}
	transitionAnimations.prototype.playPlayerKill = function(){
		this.playerKillActive = true;
	}
	transitionAnimations.prototype.playBeginButtonAnimation = function(){
		this.beginButtonAnimationActive = true;
	}
	transitionAnimations.prototype.playBeginButtonAnimationR = function(){
		this.beginButtonAnimationRActive = true;
	}
	transitionAnimations.prototype.playFinaleRoundTransition = function(){
		this.finaleRoundTransitionActive = true;
	}
	transitionAnimations.prototype.playFinalCoreAnimation = function(){
		this.finalCoreAnimationActive = true;
	}
	transitionAnimations.prototype.playBishopAnimation = function(){
		this.bishopAnimationActive = true;
	}
	transitionAnimations.prototype.playBishopAnimationR = function(){
		this.bishopAnimationRActive = true;
	}
	transitionAnimations.prototype.playNowtroAnimation = function(){
		this.nowtroAnimationActive = true;
	}
	transitionAnimations.prototype.playNowtroAnimationR = function(){
		this.nowtroAnimationRActive = true;
	}
	transitionAnimations.prototype.playEntranceReveal = function(){
		this.enteranceRevealActive = true;
	}
	transitionAnimations.prototype.playHelpButtonLightAnimation = function(){
		this.helpButtonLightAnimationActive = true;
	}
	transitionAnimations.prototype.playHelpButtonLightAnimationR = function(){
		this.helpButtonLightAnimationRActive = true;
	}
	transitionAnimations.prototype.playHelpTextRevealAnimation = function(){
		this.helpTextRevealActive = true;
	}
	transitionAnimations.prototype.playHelpTextHideAnimation = function(){
		this.helpTextHideAnimationActive = true;
		this.helpTextRevealActive = false;
	}
	
	transitionAnimations.prototype.playActiveAnimations = function(){
		if(this.roundTransitionActive){
			this.advanceRoundTransition();
		}
		if(this.actTransitionActive){
			this.advanceActTransition();
		}
		if(this.actMazeRevealActive){
			this.advanceActMazeReveal();
		}
		if(this.menuRevealActive){
			this.advanceMenuReveal();
		}
		if(this.beginButtonAnimationActive){
			this.advanceBeginButtonAnimation();
		}
		if(this.beginButtonAnimationRActive){
			this.advanceBeginButtonAnimationR();
		}
		if(this.playIntroActive){
			this.advanceIntro();
		}
		if(this.finaleRoundTransitionActive){
			this.advanceFinaleRoundTransition();
		}
		if(this.finalCoreAnimationActive){
			this.advanceFinalCoreAnimation();
		}
		if(this.outroActive){
			this.advanceOutro();
		}
		if(this.bishopAnimationActive){
			this.advanceBishopAnimation();
		}
		if(this.bishopAnimationRActive){
			this.advanceBishopRAnimation();
		}
		if(this.nowtroAnimationActive){
			this.advanceNowtroAnimation();
		}
		if(this.nowtroAnimationRActive){
			this.advanceNowtroRAnimation();
		}
		if(this.enteranceRevealActive){
			this.advanceEnteranceReveal();
		}
		if(this.enteranceSealActive){
			this.advanceEnteranceSeal();
		}
		if(this.helpButtonLightAnimationActive){
			this.advanceHelpButtonLightAnimation();
		}
		if(this.helpButtonLightAnimationRActive){
			this.advanceHelpButtonLightRAnimation();
		}
		if(this.helpTextRevealActive){
			this.advanceHelpTextReveal();
		}
		if(this.helpTextHideAnimationActive){
			this.advanceHelpTextHideAnimation();
		}
	}
	
	transitionAnimations.prototype.advanceMenuReveal = function(){
		if(this.menuRevealStage==0){
			this.titleText = new textTyper(2,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/1.5),null,null,false,100,'bold','center',true,true,false);
			this.titleText.passText('PHANTOM NODE');
			
			this.soundMan.soundScape = 'menu';
			
			this.menuRevealStage++;
		}else{
			if(this.menuRevealStage==1){
				if(this.titleText.vertPos==this.titleText.lineCount){
					this.menuRevealStage++;
				}
				this.titleText.nextChar();
			}else{
				if(this.menuRevealStage==2){
					this.creditText = new textTyper(2,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+95,null,null,false,30,'bold','center',true,true,false);
					this.creditText.passText("A GAME BY KYLE CONNOR");
					this.menuRevealStage++;
				}else{
					if(this.menuRevealStage==3){
						if(this.creditText.vertPos==this.creditText.lineCount){
							this.menuRevealStage++;
						}
						this.creditText.nextChar();
					}else{
						if(this.menuRevealStage==13){
							this.startText = new textTyper(2,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+35,null,null,false,50,'bold','center',true,true,false);
							this.startText.passText('BEGIN');
							this.menuRevealStage++;
						}else{
							if(this.menuRevealStage==14){
								if(this.startText.vertPos==this.startText.lineCount){
									this.menuRevealStage++;
								}
								this.startText.nextChar();
							}else{
								if(this.menuRevealStage==15){
									this.menuRevealStage = 0;
									this.menuRevealActive = false;
								}
							}
						}
						if(this.menuRevealStage==4){
							this.musicCreditText = new textTyper(0,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+130,null,null,false,30,'bold','center',true,true,false);
							this.musicCreditText.passText("MUSIC BY");
							this.menuRevealStage++;
						}
						if(this.menuRevealStage==5){
							if(this.musicCreditText.vertPos==this.musicCreditText.lineCount){
								this.menuRevealStage++;
							}
							this.musicCreditText.nextChar();
						}
						if(this.menuRevealStage==6){
							this.bishopCreditText = new textTyper(0,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+155,null,null,false,30,'bold','center',true,true,false);
							this.bishopCreditText.passText("DROID BISHOP");
							this.menuRevealStage++;
						}
						if(this.menuRevealStage==7){
							if(this.bishopCreditText.vertPos==this.bishopCreditText.lineCount){
								this.menuRevealStage++;
							}
							this.bishopCreditText.nextChar();
						}
						if(this.menuRevealStage==8){
							this.nowtroCreditText = new textTyper(0,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+180,null,null,false,30,'bold','center',true,true,false);
							this.nowtroCreditText.passText("NOWTRO");
							this.menuRevealStage++;
						}
						if(this.menuRevealStage==9){
							if(this.nowtroCreditText.vertPos==this.nowtroCreditText.lineCount){
								this.menuRevealStage++;
							}
							this.nowtroCreditText.nextChar();
						}
						if(this.menuRevealStage==10){
							this.bishopBox = new paper.Path.Rectangle(paper.view.center.x-61,paper.view.center.y-(paper.view.center.y/2)+148+15,149,18);
							this.nowtroBox = new paper.Path.Rectangle(paper.view.center.x-23,paper.view.center.y-(paper.view.center.y/2)+172+15,75,18);
							this.startTextBox = new paper.Path.Rectangle(paper.view.center.x-37,paper.view.center.y-(paper.view.center.y/2)+30,103,30);
							this.menuRevealStage++;
						}
						if(this.menuRevealStage==11){
							this.F11Text = new textTyper(0,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+60,null,null,false,30,'bold','center',true,true,false);
							this.F11Text.passText("(PRESS F11 FOR OPTIMAL EXPERIENCE)");
							this.menuRevealStage++;
						}
						if(this.menuRevealStage==12){
							if(this.F11Text.vertPos==this.F11Text.lineCount){
								this.menuRevealStage++;
							}
							this.F11Text.nextChar();
						}
					}
				}
			}
		}
	}
	transitionAnimations.prototype.advanceIntro = function(){
		//Animates the intro for the game.
		//Clear the elements on the screen.
		if(this.introStage==0){
			if(this.titleText.textArray[0].content.length>0){
				this.titleText.textArray[0].content = this.titleText.textArray[0].content.slice(0,this.titleText.textArray[0].content.length-1);
			}
			if(this.creditText.textArray[0].content.length>0){
				this.creditText.textArray[0].content = this.creditText.textArray[0].content.slice(0,this.creditText.textArray[0].content.length-1);
			}
			if(this.startText.textArray[0].content.length>0){
				this.startText.textArray[0].content = this.startText.textArray[0].content.slice(0,this.startText.textArray[0].content.length-1);
			}
			if(this.startText.textArray[0].content.length>0){
				this.musicCreditText.textArray[0].content = this.startText.textArray[0].content.slice(0,this.startText.textArray[0].content.length-1);
			}
			if(this.startText.textArray[0].content.length>0){
				this.bishopCreditText.textArray[0].content = this.startText.textArray[0].content.slice(0,this.startText.textArray[0].content.length-1);
			}
			if(this.startText.textArray[0].content.length>0){
				this.nowtroCreditText.textArray[0].content = this.startText.textArray[0].content.slice(0,this.startText.textArray[0].content.length-1);
			}
			if(this.F11Text.textArray[0].content.length>0){
				this.F11Text.textArray[0].content = "";
			}
			if(this.titleText.textArray[0].content.length==0&&this.creditText.textArray[0].content.length==0&&this.startText.textArray[0].content.length==0){
				this.introStage++;
			}
		}
		if(this.introStage==1){
			this.soundMan.stopSoundscapes();
			this.soundMan.soundScape = 'none';
			this.backLns.clearAllLines();
			this.backLns.freezeTheLines();
			this.backSq.gimmieTheSquare().fillColor = 'white';
			this.backSq.gimmieTheSquare().fillColor.brightness = 1;
			this.introStage++;
		}
		if(this.introStage==2){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==3){
			this.introText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false,'black');
			this.introText.passText('FIND ME');
			this.introStage++;
		}
		if(this.introStage==4){
			if(this.introText.vertPos==this.introText.lineCount){
				this.introStage++;
			}
			this.introText.nextChar();
		}
		if(this.introStage==5){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==6){
			if(this.introText.textArray[0].content.length>0){
				this.introText.textArray[0].content = this.introText.textArray[0].content.slice(0,this.introText.textArray[0].content.length-1);
			}else{
				this.introStage++;
			}
		}
		if(this.introStage==7){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==8){
			this.introText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false,'black');
			this.introText.passText('MAKE ME WHOLE');
			this.introStage++;
		}
		if(this.introStage==9){
			if(this.introText.vertPos==this.introText.lineCount){
				this.introStage++;
			}
			this.introText.nextChar();
		}
		if(this.introStage==10){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==11){
			if(this.introText.textArray[0].content.length>0){
				this.introText.textArray[0].content = this.introText.textArray[0].content.slice(0,this.introText.textArray[0].content.length-1);
			}else{
				this.introStage++;
			}
		}
		if(this.introStage==12){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==13){
			this.introText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false,'black');
			this.introText.passText('MAKE US WHOLE');
			this.introStage++;
		}
		if(this.introStage==14){
			if(this.introText.vertPos==this.introText.lineCount){
				this.introStage++;
			}
			this.introText.nextChar();
		}
		if(this.introStage==15){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==16){
			if(this.introText.textArray[0].content.length>0){
				this.introText.textArray[0].content = this.introText.textArray[0].content.slice(0,this.introText.textArray[0].content.length-1);
			}else{
				this.introStage++;
			}
		}
		if(this.introStage==17){
			this.backSq.gimmieTheSquare().fillColor.brightness = this.backSq.gimmieTheSquare().fillColor.brightness-0.01;
			if(this.backSq.gimmieTheSquare().fillColor.brightness <= 0){
				this.introStage++;
			}
		}
		if(this.introStage==18){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==19){
			this.introText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false);
			this.introText.passText('START HERE:');
			this.introStage++;                  
		}
		if(this.introStage==20){
			if(this.introText.vertPos==this.introText.lineCount){
				this.introStage++;
			}
			this.introText.nextChar();
		}
		if(this.introStage==21){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==22){
			if(this.introText.textArray[0].content.length>0){
				this.introText.textArray[0].content = this.introText.textArray[0].content.slice(0,this.introText.textArray[0].content.length-1);
			}else{
				this.introStage++;
			}
		}
		if(this.introStage==23){
			if(this.introDelay==this.introDelayFrame){
				this.introStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.introStage==24){
			dataTyper.upperRect.bounds.height = 2;
			storyTyper.upperRect.bounds.height = 2;
			storyTyper.upperRect.strokeColor = 'black';
			storyTyper.upperRect.shadowColor = 'black';
			dataTyper.moveTyper(0,5000);
			storyTyper.moveTyper(0,5000);
			this.introStage++;
		}
		if(this.introStage==25){
			if(dataTyper.upperRect.bounds.height >= 125){
				dataTyper.upperRect.bounds.height = 125;
				storyTyper.upperRect.strokeColor = playerColor;
				storyTyper.upperRect.shadowColor = playerColor;
				this.introStage++;
			}else{
				dataTyper.upperRect.bounds.height = dataTyper.upperRect.bounds.height + 10;
			}
		}
		if(this.introStage==26){
			if(storyTyper.upperRect.bounds.height >= 500){
				storyTyper.upperRect.bounds.height = 500;
				this.serverTextContent = 'MIAMINOW NEWS HUB';
				this.introStage++;
			}else{
				storyTyper.upperRect.bounds.height = storyTyper.upperRect.bounds.height + 10;
			}
		}
		if(this.introStage==27){
			if(this.serverTextTypeDelay==this.serverTextFrame){
				this.serverTextFrame=0;
				if(this.serverNodeTextContent.length > this.serverNodeText.content.length){
					//OSDNeeded = true;
					//console.log(OSDNeeded);
					//Draw the next character.
					this.serverNodeText.content = (this.serverNodeText.content).concat(this.serverNodeTextContent.charAt(this.serverTextHorzPos));
					this.serverTextHorzPos++;
				}else{
					this.serverTextHorzPos=0;
					this.introStage++;
				}
			}else{
				this.serverTextFrame++;
			}
		}
		if(this.introStage==28){
			if(this.serverTextTypeDelay==this.serverTextFrame){
				this.serverTextFrame=0;
				if(this.serverTextContent.length > this.serverText.content.length){
					//Draw the next character.
					this.serverText.content = (this.serverText.content).concat(this.serverTextContent.charAt(this.serverTextHorzPos));
					this.serverTextHorzPos++;
				}else{
					this.serverTextHorzPos=0;
					//OSDNeeded = false;
					this.introStage++;
				}
			}else{
				this.serverTextFrame++;
			}
		}
		if(this.introStage==29){
			this.serverText.content = this.serverText.content.concat('.  ');
			this.connectingServerDotMode = 0;
			this.introStage++;
		}
		if(this.introStage==30){
			if(this.dotTimeDelay!=this.dotTime){
				this.dotTime++;
				if((this.serverTextTypeDelay*8)==this.serverTextFrame){
					this.serverTextFrame=0;
					this.serverText.content = this.serverText.content.slice(0,(this.serverText.content).length-3);
					if(this.connectingServerDotMode==0){
						this.serverText.content = this.serverText.content.concat(' . ');
					}
					if(this.connectingServerDotMode==1){
						this.serverText.content = this.serverText.content.concat('  .');
					}
					if(this.connectingServerDotMode==2){
						this.serverText.content = this.serverText.content.concat('.  ');
					}
					if(this.connectingServerDotMode==2){
						this.connectingServerDotMode = 0;
					}else{
						this.connectingServerDotMode++;
					}
				}else{
					this.serverTextFrame++;
				}
			}else{
				this.dotTime = 0;
				this.serverTextFrame=0;
				this.introStage++;
			}
		}
		if(this.introStage==31){
			this.serverNodeText.content = "";
			this.serverText.content = "";
			this.introStage++;
		}
		if(this.introStage==32){
			this.theMaze.moveMaze(0,5000);
			this.UIObj.setHiderPos(paper.view.center.y);
			for(i=0;i<this.actZoomOutDuration;i++){			
				this.theMaze.zoomMaze(0.9);
				this.UIObj.scaleHider(0.9);
				Core.scale(0.9);
			}
			this.introStage++;
		}
		if(this.introStage==33){
			if(this.actZoomOutDuration==this.actZoomOutFrame){
				this.actZoomOutFrame=0;
				this.actMazeRevStage=0;
				this.backLns.zoomOutLinesActive = false;
				this.playIntroActive=false
				this.introStage=0;
				this.backLns.chromat = false;
				this.backLns.freezeLines = false;
				this.backSq.gimmieTheSquare().fillColor.alpha = 0;
			}else{
				this.theMaze.zoomMaze(10/9);
				this.UIObj.scaleHider(10/9);
				this.backLns.zoomOutLines(10/9);
				Core.scale(10/9);
				this.theHelpButton.revealHelpButton();
				this.actZoomOutFrame++;
			}
			this.soundMan.soundScape = 'game';
		}
	}
	transitionAnimations.prototype.advanceActTransition = function(){
		//Plays between acts.
		//Display text
		this.winText.bringToFront();
		if(this.ActTransStage==0){
			this.toggleWhiteMode();
			this.ActTransStage++;
		}
		if(this.ActTransStage == 1){
			if(this.winTextTypeDelay==this.winTextFrame){
				//OSDNeeded = true;
				this.winTextFrame=0;
				if(this.winTextContent.length > this.winText.content.length){
					//Draw the next character.
					this.winText.content = (this.winText.content).concat(this.winTextContent.charAt(this.winTextHorzPos));
					this.winTextHorzPos++;
				}else{
					this.toggleWhiteMode();
					this.ActTransStage = 2;
					//OSDNeeded = false;
					this.winText.content = "";
					this.winTextHorzPos=0;
				}
			}else{
				this.winTextFrame++;
			}
		}
		if(this.ActTransStage==2){
			if(this.actZoomOutDuration==this.actZoomOutFrame){
				this.actZoomOutFrame = 0;
				this.ActTransStage=3;
			}else{
				//Zoom out.
				this.zoomCount++;
				this.theMaze.zoomMaze(0.9);
				this.backLns.zoomOutLines(0.9);
				this.actZoomOutFrame++;
			}

		}
		//Blank maze & lines.
		if(this.ActTransStage==3){
			//this.theMaze.blankMaze();
			mazeGroup.fillColor = 'black';
			mazeGroup.strokeColor = 'black';
			mazeGroup.shadowColor = 'black';
			enterSegGroup.strokeColor = 'black';
			enterSegGroup.shadowColor = 'black';
			this.backLns.blankLines();
			if(currRings==1){
				this.disconServerTextContent = 'MIAMINOW NEWS HUB';
				this.serverTextContent = 'CENTRAL RECORDS BUREAU';
			}else{
				if(currRings==2){
					this.disconServerTextContent = 'CENTRAL RECORDS BUREAU';
					this.serverTextContent = 'HAVENET MIAMI CAMPUS';
				}else{
					if(currRings==3){
						this.disconServerTextContent = 'HAVENET MIAMI CAMPUS';
						this.serverTextContent = 'HAVENET DATAVAULT';
					}
				}
			}
			this.ActTransStage++;
		}
		//Display Text
		if(this.ActTransStage==4){
			if(this.serverTextTypeDelay==this.serverTextFrame){
				//OSDNeeded = true;
				this.serverTextFrame=0;
				if(this.disconTextContent.length > this.disconText.content.length){
					//Draw the next character.
					this.disconText.content = (this.disconText.content).concat(this.disconTextContent.charAt(this.serverTextHorzPos));
					this.serverTextHorzPos++;
				}else{
					this.serverTextFrame = 0;
					this.serverTextHorzPos=0;
					//OSDNeeded = false;
					this.ActTransStage++;
				}
			}else{
				this.serverTextFrame++;
			}
		}
		if(this.ActTransStage==5){
			if(this.serverTextTypeDelay==this.serverTextFrame){
				//OSDNeeded = true;
				this.serverTextFrame=0;
				if(this.disconServerTextContent.length > this.disconServerText.content.length){
					//Draw the next character.
					this.disconServerText.content = (this.disconServerText.content).concat(this.disconServerTextContent.charAt(this.serverTextHorzPos));
					this.serverTextHorzPos++;
				}else{
					this.serverTextHorzPos=0;
					//OSDNeeded = false;
					this.ActTransStage++;
				}
			}else{
				this.serverTextFrame++;
			}
		}
		if(this.ActTransStage==6){
			if(this.disconHangTime==this.disconHangFrame){
				this.ActTransStage++;
				this.disconHangFrame=0;
			}else{
				this.disconHangFrame++;
			}
		}
		if(this.ActTransStage==7){
			this.disconServerText.content = "";
			this.disconText.content = "";
			this.ActTransStage++;
		}
		if(this.ActTransStage==8){
			if(this.serverTextTypeDelay==this.serverTextFrame){
				this.serverTextFrame=0;
				if(this.serverNodeTextContent.length > this.serverNodeText.content.length){
					//Draw the next character.
					this.serverNodeText.content = (this.serverNodeText.content).concat(this.serverNodeTextContent.charAt(this.serverTextHorzPos));
					this.serverTextHorzPos++;
				}else{
					this.serverTextHorzPos=0;
					this.ActTransStage++;
				}
			}else{
				this.serverTextFrame++;
			}
		}
		if(this.ActTransStage==9){
			if(this.serverTextTypeDelay==this.serverTextFrame){
				this.serverTextFrame=0;
				if(this.serverTextContent.length > this.serverText.content.length){
					//Draw the next character.
					this.serverText.content = (this.serverText.content).concat(this.serverTextContent.charAt(this.serverTextHorzPos));
					this.serverTextHorzPos++;
				}else{
					this.serverTextHorzPos=0;
					this.ActTransStage++;
				}
			}else{
				this.serverTextFrame++;
			}
		}
		if(this.ActTransStage==10){
			this.serverText.content = this.serverText.content.concat('.  ');
			this.connectingServerDotMode = 0;
			this.ActTransStage++;
		}
		if(this.ActTransStage==11){
			if(this.dotTimeDelay!=this.dotTime){
				this.dotTime++;
				if((this.serverTextTypeDelay*8)==this.serverTextFrame){
					this.serverTextFrame=0;
					this.serverText.content = this.serverText.content.slice(0,(this.serverText.content).length-3);
					if(this.connectingServerDotMode==0){
						this.serverText.content = this.serverText.content.concat(' . ');
					}
					if(this.connectingServerDotMode==1){
						this.serverText.content = this.serverText.content.concat('  .');
					}
					if(this.connectingServerDotMode==2){
						this.serverText.content = this.serverText.content.concat('.  ');
					}
					if(this.connectingServerDotMode==2){
						this.connectingServerDotMode = 0;
					}else{
						this.connectingServerDotMode++;
					}
				}else{
					this.serverTextFrame++;
				}
			}else{
				this.dotTime = 0;
				this.serverTextFrame=0;
				this.ActTransStage++;
			}
		}
		if(this.ActTransStage==12){
			this.serverNodeText.content = "";
			this.serverText.content = "";
			this.actTransitionActive = false;
			this.ActTransStage = 0;
		}
	}
	transitionAnimations.prototype.advanceActMazeReveal = function(){
		if(this.actMazeRevStage == 0){
			for(i=0;i<this.actZoomOutDuration;i++){			
				this.theMaze.zoomMaze(0.9);
				this.UIObj.scaleHider(0.9);
				Core.scale(0.9);
			}	
			//this.backLns.zoomOutLines();
			this.actMazeRevStage++;
		}else{
			if(this.actMazeRevStage==1){
				this.theMaze.moveMaze(0,5000);
				this.UIObj.setHiderPos(paper.view.center.y);
				this.actMazeRevStage++;
			}else{
				if(this.actMazeRevStage==2){
					if(this.actZoomOutDuration==this.actZoomOutFrame){
						this.actZoomOutFrame=0;
						this.actMazeRevStage=0;
						this.backLns.zoomOutLinesActive = false;
						this.actMazeRevealActive=false;
					}else{
						this.theMaze.zoomMaze(10/9);
						this.UIObj.scaleHider(10/9);
						this.backLns.zoomOutLines(10/9);
						Core.scale(10/9);
						this.actZoomOutFrame++;
					}
				}
			}
		}
	}
	transitionAnimations.prototype.advanceRoundTransition = function(){
		//Plays between rounds, this is where the maze moves up and off the screen.
		//Display "FILE RETRIEVED" text.
		this.winText.bringToFront();
		if(this.roundTransStage==0){
			this.toggleWhiteMode();
			this.roundTransStage++;
		}
		if(this.roundTransStage == 1){
			if(this.winTextTypeDelay==this.winTextFrame){
				this.winTextFrame=0;
				if(this.winTextContent.length > this.winText.content.length){
					//Draw the next character.
					this.winText.content = (this.winText.content).concat(this.winTextContent.charAt(this.winTextHorzPos));
					this.winTextHorzPos++;
				}else{
					this.toggleWhiteMode();
					this.roundTransStage = 2;
					this.winText.content = "";
					this.winTextHorzPos=0;
				}
			}else{
				this.winTextFrame++;
			}
		}
		//Move the maze up off the screen.
		if(this.roundTransStage==2){
			this.theMaze.moveMaze(0,-(10));
			this.backLns.paralaxLines(-5);
			if(mazeCenter.y<-(paper.view.center.y)){
				this.roundTransStage = 3;
			}
		}
		if(this.roundTransStage==3){
			this.theMaze.moveMaze(0,4*paper.view.center.y);
			this.UIObj.removeHider();
			this.UIObj.drawHider();
			this.UIObj.setHiderPos(mazeGroup.position.y);
			exitSegGroup.fillColor = mazeColor;
			exitSegGroup.strokeColor = mazeColor;
			enterSegGroup.fillColor = mazeColor;
			exitSegGroup.strokeColor = mazeColor;
			this.roundTransStage = 4;
		}

		if(this.roundTransStage==4){
			this.theMaze.moveMaze(0,-(10));
			this.UIObj.setHiderPos(mazeGroup.position.y);
			this.backLns.paralaxLines(-5);
			if(mazeCenter.y<paper.view.center.y){
				this.theMaze.setMazePos(mazeCenterX,mazeCenterY);
				this.roundTransitionActive=false;
				this.roundTransStage = 0;
			}
		}
		/**
		if(this.roundTransStage==5){
			if(this.winWhiteFlashDuration==this.winWhiteFlashFrame){
				this.toggleWhiteMode();
				this.winWhiteFlashFrame=0;
			}else{
				this.winWhiteFlashFrame++;
			}
		}
		**/
	}
	transitionAnimations.prototype.advanceOutro = function(){
		//Plays at the end of the game.
		//Move unneeded elements off the screen
		if(this.outroStage == 0){
			theMaze.moveMaze(0,-5000);
			storyTyper.moveTyper(0,-5000);
			dataTyper.moveTyper(0,-5000);
			this.backLns.chromat = true;
			this.outroStage++;
		}
		if(this.outroStage==1){
			this.outroText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false,playerColor);
			this.outroText.passText('WE ARE WHOLE.');
			this.outroStage++;
		}
		if(this.outroStage==2){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==3){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==4){
			if(this.outroText.textArray[0].content.length>0){
				this.outroText.textArray[0].content = this.outroText.textArray[0].content.slice(0,this.outroText.textArray[0].content.length-1);
			}else{
				this.outroStage++;
			}
		}
		if(this.outroStage==5){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==6){
			this.outroText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false,playerColor);
			this.outroText.passText('I AM WHOLE.');
			this.outroStage++;
		}
		if(this.outroStage==7){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==8){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==9){
			if(this.outroText.textArray[0].content.length>0){
				this.outroText.textArray[0].content = this.outroText.textArray[0].content.slice(0,this.outroText.textArray[0].content.length-1);
			}else{
				this.outroStage++;
			}
		}
		if(this.outroStage==10){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==11){
			this.outroText = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+75,null,null,false,60,'bold','center',true,true,false,playerColor);
			this.outroText.passText('A GAME BY');
			this.outroStage++;
		}
		if(this.outroStage==12){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==13){
			this.outroText2 = new textTyper(5,1,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2)+125,null,null,false,60,'bold','center',true,true,false,playerColor);
			this.outroText2.passText('KYLE CONNOR');
			this.outroStage++;
		}
		if(this.outroStage==14){
			if(this.outroText2.vertPos==this.outroText2.lineCount){
				this.outroStage++;
			}
			this.outroText2.nextChar();
		}
		if(this.outroStage==15){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==16){
			if(this.outroText.textArray[0].content.length>0){
				this.outroText.textArray[0].content = this.outroText.textArray[0].content.slice(0,this.outroText.textArray[0].content.length-1);
			}else{
				this.outroStage++;
			}
		}
		if(this.outroStage==17){
			if(this.outroText2.textArray[0].content.length>0){
				this.outroText2.textArray[0].content = this.outroText2.textArray[0].content.slice(0,this.outroText2.textArray[0].content.length-1);
			}else{
				this.outroStage++;
			}
		}
		if(this.outroStage==18){
			this.outroText = new textTyper(0,18,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2),null,null,false,20,'normal','center',true,true,false,playerColor);
			this.outroText.passText('DETECTIVE IMPLICATED IN MURDER');
			this.outroText.passText('Steve Tredor - MiamiNewsNow!');
			this.outroText.passText('');
			this.outroText.passText('Detective Dennis Morrow has been');
			this.outroText.passText('suspended following new evidence');
			this.outroText.passText('that he was involved with the death');
			this.outroText.passText('of Maurice Zir, who was killed by');
			this.outroText.passText('a speeding van last month.');
			this.outroText.passText('');
			this.outroText.passText('A series of emails received by');
			this.outroText.passText('Miami Police IA implicates Morrow');
			this.outroText.passText('in a hit on Zir, who wrote for');
			this.outroText.passText('MiamiNewsNow.');
			this.outroText.passText('');
			this.outroText.passText('The source of the emails are');
			this.outroText.passText('unknown, but IA Head Tia Arion');
			this.outroText.passText('says their authenticity has been');
			this.outroText.passText('confirmed.');
			this.outroStage++;
		}
		if(this.outroStage==19){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==20){
			if(this.outroText.textArray[this.outroTextChop].content.length>0){
				this.outroText.textArray[this.outroTextChop].content = this.outroText.textArray[this.outroTextChop].content.slice(0,this.outroText.textArray[this.outroTextChop].content.length-1);
			}else{
				this.outroTextChop++;
			}
			if(this.outroTextChop==this.outroText.lineCount){
				this.outroTextChop = 0;
				this.outroStage++;
			}
		}
		if(this.outroStage==21){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==22){
			this.outroText = new textTyper(2,8,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2),null,null,false,60,'bold','center',true,true,false,playerColor,50);
			this.outroText.passText('MUSIC:');
			this.outroText.passText('NEON MARATHON (DROID BISHOP REMIX)');
			this.outroText.passText('');
			this.outroText.passText('ORIGINAL MIX BY');
			this.outroText.passText('NOWTRO');
			this.outroText.passText('');
			this.outroText.passText('REMIX BY');
			this.outroText.passText('DROID BISHOP');
			this.outroStage++;
		}
		if(this.outroStage==23){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==24){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==25){
			if(this.outroText.textArray[this.outroTextChop].content.length>0){
				this.outroText.textArray[this.outroTextChop].content = this.outroText.textArray[this.outroTextChop].content.slice(0,this.outroText.textArray[this.outroTextChop].content.length-1);
			}else{
				this.outroTextChop++;
			}
			if(this.outroTextChop==this.outroText.lineCount){
				this.outroTextChop = 0;
				this.outroStage++;
			}
		}
		if(this.outroStage==26){
			this.outroText = new textTyper(0,18,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2),null,null,false,20,'normal','center',true,true,false,playerColor);
			this.outroText.passText('VICE MAYOR ARRESTED FOR THREATS, COERCION');
			this.outroText.passText('');
			this.outroText.passText('Steve Tredor - MiamiNewsNow!');
			this.outroText.passText('');
			this.outroText.passText('Vice Mayor Rosato has been arrested');
			this.outroText.passText('for the coercion of Detective Morrow');
			this.outroText.passText('to murder Maurice Zir.');
			this.outroText.passText('');
			this.outroText.passText('Rosato reportedly threatened Morrow');
			this.outroText.passText('and his family last month to coerce');
			this.outroText.passText('Morrow into silencing former MiamiNewsNow');
			this.outroText.passText('reporter Maurice Zir.');
			this.outroText.passText('');
			this.outroText.passText('While the email evidence implicating Rosato');
			this.outroText.passText('has not been released, a source close to the');
			this.outroText.passText('matter indicates that this is related to');
			this.outroText.passText('the two stories Zir wrote on Leon Garcia, who');
			this.outroText.passText('also died last month.');
			
			this.outroStage++;
		}
		if(this.outroStage==27){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==28){
			if(this.outroText.textArray[this.outroTextChop].content.length>0){
				this.outroText.textArray[this.outroTextChop].content = this.outroText.textArray[this.outroTextChop].content.slice(0,this.outroText.textArray[this.outroTextChop].content.length-1);
			}else{
				this.outroTextChop++;
			}
			if(this.outroTextChop==this.outroText.lineCount){
				this.outroTextChop = 0;
				this.outroStage++;
			}
		}
		if(this.outroStage==29){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==30){
			this.outroText = new textTyper(2,9,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2),null,null,false,60,'bold','center',true,true,false,playerColor,50);
			this.outroText.passText('MADE WITH');
			this.outroText.passText('PAPERJS VECTOR LIBRARY');
			this.outroText.passText('JUERG LEHNI AND JONATHAN PUCKEY');
			this.outroText.passText('');
			this.outroText.passText('HOWLER AUDIO LIBRARY');
			this.outroText.passText('JAMES SIMPSON AND GOLDFIRE STUDIOS');
			this.outroText.passText('');
			this.outroText.passText('VT323 FONT');
			this.outroText.passText('PETER HULL');
			this.outroStage++;
		}
		if(this.outroStage==31){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==32){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==33){
			if(this.outroText.textArray[this.outroTextChop].content.length>0){
				this.outroText.textArray[this.outroTextChop].content = this.outroText.textArray[this.outroTextChop].content.slice(0,this.outroText.textArray[this.outroTextChop].content.length-1);
			}else{
				this.outroTextChop++;
			}
			if(this.outroTextChop==this.outroText.lineCount){
				this.outroTextChop = 0;
				this.outroStage++;
			}
		}
		if(this.outroStage==34){
			this.outroText = new textTyper(0,19,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2),null,null,false,20,'normal','center',true,true,false,playerColor);
			this.outroText.passText('AI DEMANDS CITIZENSHIP');
			this.outroText.passText('');
			this.outroText.passText('Steve Tredor - MiamiNewsNow!');
			this.outroText.passText('');
			this.outroText.passText('A computer program identifying itself');
			this.outroText.passText('as the late Leon Garcia released');
			this.outroText.passText('a statement last night in which it');
			this.outroText.passText('demands Caribbean Confederation citizenship.');
			this.outroText.passText('');
			this.outroText.passText('HaveNet researchers say that the program');
			this.outroText.passText('is a sort of distributed AI, existing');
			this.outroText.passText('on many different machines, which allows it');
			this.outroText.passText('to wield unprecedented processing power.');
			this.outroText.passText('');
			this.outroText.passText('It is unclear if the AI actually is Garcia,');
			this.outroText.passText('who died in his apartment last month under');
			this.outroText.passText('mysterious circumstances. The AI also claims');
			this.outroText.passText('to be the one who leaked the Rosato emails');
			this.outroText.passText('to Miami Police IA.');
			
			this.outroStage++;
		}
		if(this.outroStage==35){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==36){
			if(this.outroText.textArray[this.outroTextChop].content.length>0){
				this.outroText.textArray[this.outroTextChop].content = this.outroText.textArray[this.outroTextChop].content.slice(0,this.outroText.textArray[this.outroTextChop].content.length-1);
			}else{
				this.outroTextChop++;
			}
			if(this.outroTextChop==this.outroText.lineCount){
				this.outroTextChop = 0;
				this.outroStage++;
			}
		}
		if(this.outroStage==37){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==38){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
		if(this.outroStage==39){
			this.outroText = new textTyper(10,9,60,paper.view.center.x,paper.view.center.y-(paper.view.center.y/2),null,null,false,60,'bold','center',true,true,false,playerColor,50);
			this.outroText.passText('THE END');
			this.outroStage++;
		}
		if(this.outroStage==40){
			if(this.outroText.vertPos==this.outroText.lineCount){
				this.outroStage++;
			}
			this.outroText.nextChar();
		}
		if(this.outroStage==41){
			if(this.introDelay==this.introDelayFrame){
				this.outroStage++;
				this.introDelayFrame=0;
			}else{
				this.introDelayFrame++;
			}
		}
	}
	transitionAnimations.prototype.advancePointerToBall = function(){
		//Plays whenever the pointer becomes a ball.
	}
	transitionAnimations.prototype.advanceBallToPointer = function(){
		//Plays whenever the ball goes back to a pointer.
	}
	transitionAnimations.prototype.advanceCoreGrab = function(){
		//Plays whenever the player grabs the core.
	}
	transitionAnimations.prototype.advanceExitReveal = function(){
		//Plays when the exit is revealed.
	}
	transitionAnimations.prototype.advanceEnteranceSeal = function(){
		//Plays when the entrance is sealed.
		if(this.enteranceSealStage==0){
			enterSegGroup.fillColor = mazeColor;
			enterSegGroup.strokeColor = mazeColor;
			enterSegGroup.shadowColor = mazeColor;
			this.enteranceSealActive = false;
		}
	}
	transitionAnimations.prototype.advancePlayerKill = function(){
		//Plays when the connection is terminated.
	}
	transitionAnimations.prototype.advanceBeginButtonAnimation = function(){
		if(this.beginButtonStage==0){
			this.startText.recolorTyper('white');
			this.beginLit = true;
			this.beginButtonStage++;
		}
		if(this.beginButtonStage==1){
			this.beginButtonStage=0;
			this.beginButtonAnimationActive=false;
		}
	}
	transitionAnimations.prototype.advanceBeginButtonAnimationR = function(){
		if(this.beginButtonRStage==0){
			this.startText.recolorTyper(playerColor);
			this.beginLit = false;
			this.beginButtonRStage++;
		}
		if(this.beginButtonRStage==1){
			this.beginButtonRStage=0;
			this.beginButtonAnimationRActive=false;
		}
	}
	transitionAnimations.prototype.advanceFinaleRoundTransition = function(){
		if(this.finaleRoundStage==0){
			this.finaleRoundStage++;
		}
		if(this.finaleRoundStage==1){
			if(Core.bounds.width>=680){
				this.finaleZoomMazeFrame = 0;
				this.finaleRoundStage++;
			}else{
				this.theMaze.zoomMaze(1.1);
				this.finaleZoomMazeFrame++;
			}
		}
		if(this.finaleRoundStage==2){
			this.finaleRoundTransitionActive=false;
			this.finaleRoundStage=0;
		}
	}
	transitionAnimations.prototype.advanceFinalCoreAnimation = function(){
		if(this.finalCoreAnimationStage == 0){
			Core.fillColor = playerColor;
			Core.strokeColor = playerColor;
			Core.shadowColor = playerColor;
			this.finalCoreAnimationStage++;
		}
		if(this.finalCoreAnimationStage==1){
			Core.fillColor.hue += 1;
			Core.strokeColor.hue += 1;
			Core.shadowColor.hue += 1;
		}
	}
	transitionAnimations.prototype.toggleWhiteMode = function(){
		if(this.isWhite==false){
			this.isWhite=true;
			
			this.backSq.gimmieTheSquare().fillColor = 'white';
			this.backSq.gimmieTheSquare().sendToBack();
			mazeGroup.fillColor = 'black';
			enterSegGroup.fillColor = 'black';
			mazeGroup.shadowColor = 'black';
			enterSegGroup.shadowColor = 'black';
			mazeGroup.strokeColor = 'black';
			enterSegGroup.strokeColor = 'black';
			this.backLns.recolorLines('black','black');
		}else{
			this.isWhite=false;
			
			this.backSq.gimmieTheSquare().fillColor.alpha = 0;
			//this.backSq.gimmieTheSquare().sendToBack();
			mazeGroup.fillColor = mazeColor;
			enterSegGroup.fillColor = mazeColor;
			mazeGroup.shadowColor = mazeColor;
			enterSegGroup.shadowColor = mazeColor;
			mazeGroup.strokeColor = mazeColor;
			enterSegGroup.strokeColor = mazeColor;
			this.backLns.recolorLines(backColor,mazeColor);
		}
	}
	transitionAnimations.prototype.advanceBishopAnimation = function(){
		if(this.bishopStage==0){
			this.bishopCreditText.recolorTyper('white');
			this.droidLit = true;
			this.bishopStage++;
		}
		if(this.bishopStage==1){
			this.bishopStage=0;
			this.bishopAnimationActive=false;
		}
	}
	transitionAnimations.prototype.advanceBishopRAnimation = function(){
		if(this.bishopRStage==0){
			this.bishopCreditText.recolorTyper(playerColor);
			this.droidLit = false;
			this.bishopRStage++;
		}
		if(this.bishopRStage==1){
			this.bishopRStage=0;
			this.bishopAnimationRActive=false;
		}
	}
	transitionAnimations.prototype.advanceNowtroAnimation = function(){
		if(this.nowtroStage==0){
			this.nowtroCreditText.recolorTyper('white');
			this.nowtroLit = true;
			this.nowtroStage++;
		}
		if(this.nowtroStage==1){
			this.nowtroStage=0;
			this.nowtroAnimationActive=false;
		}
	}
	transitionAnimations.prototype.advanceNowtroRAnimation = function(){
		if(this.nowtroRStage==0){
			this.nowtroCreditText.recolorTyper(playerColor);
			this.nowtroLit = false;
			this.nowtroRStage++;
		}
		if(this.nowtroRStage==1){
			this.nowtroRStage=0;
			this.nowtroAnimationRActive=false;
		}
	}
	transitionAnimations.prototype.advanceEnteranceReveal = function(){
		if(this.enteranceRevealStage==0){
			if(this.thirtyDelay == this.thirtyDelayFrame){
				this.thirtyDelayFrame = 0;
				this.enteranceRevealStage++;
			}else{
				this.thirtyDelayFrame++;
			}
		}
		if(this.enteranceRevealStage==1){
			enterSegGroup.fillColor = 'white';
			enterSegGroup.strokeColor = 'white';
			enterSegGroup.shadowColor = 'white';
			this.enteranceRevealStage++;
		}
		if(this.enteranceRevealStage==2){
			if(this.thirtyDelay == this.thirtyDelayFrame){
				this.thirtyDelayFrame = 0;
				this.enteranceRevealStage++;
			}else{
				this.thirtyDelayFrame++;
			}
		}
		if(this.enteranceRevealStage==3){
			enterSegGroup.fillColor.brightness = enterSegGroup.fillColor.brightness - 0.05;
			enterSegGroup.strokeColor.brightness = enterSegGroup.strokeColor.brightness - 0.05;
			enterSegGroup.shadowColor.brightness = enterSegGroup.shadowColor.brightness - 0.05;
			if(enterSegGroup.fillColor.brightness <= 0){
				enterSegGroup.fillColor.alpha = 0;
				enterSegGroup.strokeColor.alpha = 0;
				enterSegGroup.shadowColor.alpha = 0;
				this.enteranceRevealStage = 0;
				this.enteranceRevealActive = false;
			}
		}
	}
	transitionAnimations.prototype.advanceHelpButtonLightAnimation = function(){
		this.theHelpButton.helpButton.fillColor = 'white';
		this.theHelpButton.helpButton.shadowColor = 'white';
		this.helpButtonLit = true;
		this.helpButtonLightAnimationActive=false;
	}
	transitionAnimations.prototype.advanceHelpButtonLightRAnimation = function(){
		this.theHelpButton.helpButton.fillColor = 'red';
		this.theHelpButton.helpButton.shadowColor = 'red';
		this.helpButtonLit = false;
		this.helpButtonLightAnimationRActive=false;
	}
	transitionAnimations.prototype.advanceHelpTextReveal = function(){
		if(this.helpTextStage==0){
			this.theHelpButton.open = true;
			this.helpTextStage++;
		}
		
		if(this.helpTextStage==1){
			if(this.theHelpButton.clipHelpBox.position.x>(paper.view.bounds.right-240)){
				this.theHelpButton.clipHelpBox.position.x = this.theHelpButton.clipHelpBox.position.x-40;
			}else{
				this.theHelpButton.clipHelpBox.position.x = (paper.view.bounds.right-245);
				this.helpTextStage++;
			}
		}
		if(this.helpTextStage==2){
			this.theHelpButton.helpTyper.passText('To start, enter the gap in the circle. Avoid');
			this.theHelpButton.helpTyper.passText('the walls, and touch the red core to reveal');
			this.theHelpButton.helpTyper.passText('the exit. Then, navigate to the exit to win.');
			this.helpTextStage++;
		}
		if(this.helpTextStage==3){
			this.theHelpButton.helpTyper.nextChar();
			if(this.theHelpButton.helpTyper.isDone()){
				this.helpTextStage=0;
				this.helpTextRevealActive = false;
			}
		}
	}
	transitionAnimations.prototype.advanceHelpTextHideAnimation = function(){
		if(this.helpTextHideStage == 0){
			this.theHelpButton.open = false;
			this.helpTextStage=0;
			this.helpTextRevealActive = false;
			this.theHelpButton.helpTyper.textBeingDrawn = [];
			this.theHelpButton.helpTyper.horzPos = 0;
			this.theHelpButton.helpTyper.vertPos = 0;
			this.theHelpButton.helpTyper.textToType = [];
			this.theHelpButton.helpTyper.clearText();
			this.theHelpButton.clipHelpBox.position.x = paper.view.bounds.right+200;
			this.helpTextHideAnimationActive = false;
		}
	}
	
	transitionAnimations.prototype.isBeginButtonAnimationActive = function(){
		return this.beginButtonAnimationActive;
	}
	transitionAnimations.prototype.isRoundTransitionActive = function(){
		return this.roundTransitionActive;
	}
	transitionAnimations.prototype.isActTransitionActive = function(){
		return this.actTransitionActive;
	}
	transitionAnimations.prototype.isActMazeRevealActive = function(){
		return this.actMazeRevealActive;
	}
	transitionAnimations.prototype.isBeginButtonAnimationRActive = function(){
		return this.beginButtonAnimationRActive;
	}
}

var backgroundSquare = function(){
	this.theBackgroundSquare;
	backgroundSquare.prototype.drawBackgroundSquare = function(){
		this.theBackgroundSquare = new paper.Path.Rectangle({
			point: [0, 0],
			size: [paper.view.size.width, paper.view.size.height]
		});
		this.theBackgroundSquare.sendToBack();
	}
	backgroundSquare.prototype.gimmieTheSquare = function(){
		return this.theBackgroundSquare;
	}
}

/**
var qualityControl = function(){
	this.qualityButton = new paper.PointText(new paper.Point(paper.view.bounds.right-150,paper.view.bounds.top+50));
	this.qualityButton.fontFamily = 'VT323';
	this.qualityButton.fontSize = 50;
	this.qualityButton.fontWeight = 'bold';
	this.qualityButton.content = 'QUALITY: LOW';
	this.qualityButton.fillColor = 'red';
	this.qualityButton.shadowColor = 'red';
	this.qualityButton.shadowBlur = 12;
	this.qualityButton.fillColor.alpha = 0;
	this.qualityButton.shadowColor.alpha = 0;
	
	this.highQuality = false;
	
	qualityControl.prototype.toggleQuality = function(){
		if(this.highQuality = false){
			
		}else{
			
		}
		
		this.highQuality = !this.highQuality;
	}
}
**/

var helpWindow = function(){
	this.helpButton = new paper.PointText(new paper.Point(paper.view.bounds.right-50,paper.view.bounds.top+50));
	this.helpButton.fontFamily = 'VT323';
	this.helpButton.fontSize = 50;
	this.helpButton.fontWeight = 'bold';
	this.helpButton.content = '?';
	this.helpButton.fillColor = 'red';
	this.helpButton.shadowColor = 'red';
	this.helpButton.shadowBlur = 12;
	this.helpButton.fillColor.alpha = 0;
	this.helpButton.shadowColor.alpha = 0;
	this.revealed = false;
	
	this.open = false;
	
	this.helpBox;
	
	this.helpRedBox = new paper.Path.Rectangle(paper.view.bounds.right-450,paper.view.bounds.top+50,400,75);
	this.helpRedBox.fillColor = 'black';
	this.helpRedBox.strokeColor = 'red';
	this.helpRedBox.shadowColor = 'red';
	this.helpRedBox.strokeWidth = 3;
	this.helpRedBox.shadowBlur = 12;
	
	this.clipHelpBox = new paper.Path.Rectangle(paper.view.bounds.right,paper.view.bounds.top+45,425,225);
	
	this.boxGroup = new paper.Group(this.clipHelpBox,this.helpRedBox);
	
	this.boxGroup.clipped = true;
	
	this.helpTyper = new textTyper(0,4,60,paper.view.bounds.right-450,paper.view.bounds.top+50,null,null,false,20,'normal','left',true,true,false);
	
	helpWindow.prototype.revealHelpButton = function(){
		this.helpButton.fillColor.alpha = 1;
		this.helpButton.shadowColor.alpha = 1;
		this.helpBox = new paper.Path.Rectangle(paper.view.bounds.right-50,paper.view.bounds.top+50,20,-29);
		this.revealed = true;
	}
	
}

var soundManager = function(){
	//load sounds
	this.mainTheme = new Howl({
      src: ['music1.mp3'],
	  isPlaying: false,
	  onend: function(){this.isPlaying=false},
	  //onplay: function(){this.isPlaying=true},
	  volume: 0.5,
	  html5: true
    });
	
	this.menuHum = new Howl({
		src: ['menuHum.mp3'],
		isPlaying: false,
		onend: function(){this.isPlaying=false},
		//onplay: function(){this.isPlaying=true},
		volume: 0.5,
		html5: true
	});
	
	this.menuClicking = new Howl({
		src: ['menuClicking.mp3'],
		isPlaying: false,
		onend: function(){this.isPlaying=false},
		//onplay: function(){this.isPlaying=true},
		volume: 0.7,
		html5: true
	});
	
	this.textTyping = new Howl({
		src: ['textOSD.mp3'],
		isPlaying: false,
		onend: function(){this.isPlaying=false},
		volume: 0.5,
		html5: true
	});
	
	this.soundScape = 'none';
	
	//This isn't a great way to do this, since it's framerate dependant, but I'm not sure
	//how to do it otherwise.
	this.clickTiming = 600;
	this.clickTimingFrame = 0;
	
	soundManager.prototype.stopSoundscapes = function(){
		this.mainTheme.stop();
		this.menuHum.stop();
		this.menuClicking.stop();
	}
	soundManager.prototype.manageSound = function(){
		//Manage soundscapes
		if(this.soundScape=='menu'){
			if(!this.menuHum.isPlaying){
				this.menuHum.play();
				this.clickTimingFrame = 0;
				this.menuHum.isPlaying = true;
			}
			if(this.clickTiming==this.clickTimingFrame){
				//console.log('boop');
				this.menuClicking.play();
				this.clickTimingFrame ++;
			}else{
				this.clickTimingFrame++;
			}
		}
		if(this.soundScape=='intro'){
			
		}
		if(this.soundScape=='game'){
			if(!this.mainTheme.isPlaying){
				this.mainTheme.play();
				this.mainTheme.isPlaying = true;
			}
		}
		if(this.soundScape=='outro'){
			
		}
		
		//Manage regular sounds
		//OSD Sound
		if(OSDNeeded&&(this.textTyping.playing()==false)){
			this.textTyping.play();
		}
		if(!OSDNeeded&&this.textTyping.playing()){
			this.textTyping.stop();
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
			this.cursor.position.x = this.mousePos.x+10;
			this.cursor.position.y = this.mousePos.y+10;
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
	
	mazeCenterX = paper.view.center.x+125;
	mazeCenterY = paper.view.center.y;
	mazeCenter = new paper.Point(mazeCenterX,mazeCenterY);
	
	//Menu related variabless
	this.inMenu = true;
	this.menuStart = false;
	
	this.allreadyStarted = false;
	this.inExitGroup = false;
	this.roundWon = false;
	this.gameLoss = false;
	this.roundTransitionPlayed = false;
	this.actTransitionPlayed=false;
	this.actMazeRevealPlayed=false;
	this.playerImmune = false;
	this.simpCount = 0;
	var coreGrabbed = false;
	var exitReveal = false;
	this.enterRevealed = false;
	this.needMazeReveal = false;
	this.mazeRevealPlayed=false;
	
	theDet = new determineColor();
	theDet.detColor();
	
	backrndLns = new backgroundLines(5,false,true);	
	
	theBack = new backgroundSquare();
	theBack.drawBackgroundSquare();
	
	theUI = new UI();
	theUI.drawUI();
	
	thePlayer = new playerSphere();
	thePlayer.createPlayer();
	thePlayer.paint();
	
	theShaker = new screenShaker();
	
	theMaze = new maze();
	theMaze.generateMaze();
	theMaze.drawMaze(mazeCenter.x,mazeCenter.y,2,ringThickness,ringSep);
	theMaze.moveMaze(0,-5000);
	
	theUI.drawHider();
	theUI.setHiderPos(-5000);
	
	theCursor = new playerCursor();
	theCursor.createCursor();
	theCursor.showCursor();
	
	dataTyper = new textTyper(0,5,60,0,0,300,125,true,20,'normal','left',false, false, true);
	storyTyper = new textTyper(0,23,60,0,150,300,500,true,20,'normal','left',false, false, true);
	dataTyper.moveTyper(0,-5000);
	storyTyper.moveTyper(0,-5000);

	helpBut = new helpWindow();
	
	soundMan = new soundManager();
	
	animator = new transitionAnimations(theMaze,theBack,backrndLns,theUI,helpBut,soundMan);
	
	theStoryteller = new storyManager(dataTyper,storyTyper,animator);
	
	
	animator.displayMenu();
	
	theMaze.sendEntranceToFront();

	
	tool.onMouseMove = function(event){
		mousePos = event.point;

		if(gameStart){
			//paintTrail.add(event.point);
		}

	}
	
	tool.onMouseDown = function(event){
		//console.log(animator.startTextBox.contains(mousePos));
		//if(animator.startText.contains(mousePos)){
		//	console.log('game start');
		//}
		if(inMenu&&animator.startTextBox.contains(mousePos)){
			animator.playIntro();
			inMenu = false;
		}
		if(inMenu&&animator.bishopBox.contains(mousePos)){
			window.open("https://soundcloud.com/droidbishop");
		}
		if(inMenu&&animator.nowtroBox.contains(mousePos)){
			window.open("https://soundcloud.com/nowtro");
		}
		if(helpBut.revealed){
			if(helpBut.helpBox.contains(mousePos)&&!helpBut.open){
				animator.playHelpTextRevealAnimation();
			}
			if(helpBut.helpBox.contains(mousePos)&&helpBut.open){
				animator.playHelpTextHideAnimation();
			}
		}
		
		//console.log('gamestart: '+ gameStart + '|insideMaze: ' + thePlayer.insideMaze() + '|hasSphere: ' + thePlayer.hasSphere() + '|cursorHidden: ' + theCursor.isItHidden());
		//console.log('coreGrabbed: ' + coreGrabbed + '|exitReveal: ' + exitReveal);
		//theMaze.moveMaze(10,10);
		//paper.view.translate(10,10);
		//console.log(theUI.isInTransition);
		/**
		if(upArrow.contains(mousePos)||downArrow.contains(mousePos)){
			if(upArrow.contains(mousePos)){
				if(currRings<maxRings){
					currRings++;
					theMaze.generateMaze();
					theMaze.drawMaze(paper.view.center.x,paper.view.center.y,2,20,64);
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
					theMaze.generateMaze();
					theMaze.drawMaze(paper.view.center.x,paper.view.center.y,2,20,64);
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
		**/
	}

	paper.view.onFrame = function(event){
		//Framrate counter
		backrndLns.pulseLines();
		animator.playActiveAnimations();
		soundMan.manageSound();
		
		if(gameStart){
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
			
			if(theUI.isHiderBelow0()==false){
				theUI.reduceHider();
			}else{
				theUI.removeHider();
			}
			
		}
		
		//Animate Hider
		theUI.animateHider();
		
		theShaker.shake();
		
		thePlayer.movePlayer(mousePos.x,mousePos.y);
		theCursor.moveCursor(thePlayer,mousePos);
		
		//Hide the help box if the mouse moves away.
		if(helpBut.open){
			if((Math.abs((mousePos.x)-(helpBut.helpBox.position.x))>450)||((Math.abs((mousePos.y)-(helpBut.helpBox.position.y))>100))){
				animator.playHelpTextHideAnimation();
				helpBut.open = false;
			}
		}
		
		//If the enterance has not been revealed, the game not started, and the storytyper done typing, reveal the enterance.
		if((!enterRevealed)&&(!gameStart)&&(storyTyper.isDone()||currRings==4)&&(!animator.actTransitionActive)&&(!animator.roundTransitionActive)&&(!animator.playIntroActive)&&(!inMenu)){
			animator.playEntranceReveal();
			enterRevealed = true;
		}
		//Mouse position related actions
		/**
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
		**/

		if(mousePos.x <= 0 || mousePos.y <= 0 || mousePos.x >= 1070 || mousePos.y >= 980){
			theCursor.hideCursor();
		}else{
			if(thePlayer.hasSphere()==false&&theCursor.isItHidden()){
				theCursor.showCursor();
			}
		}
		
		if(animator.isBeginButtonAnimationActive()==false&&animator.beginLit==false){
			if((typeof animator.startTextBox)!='undefined'){
				if(animator.startTextBox.contains(mousePos)){
					animator.playBeginButtonAnimation();
				}
			}
		}else{
			if(animator.startTextBox.contains(mousePos)==false&&animator.beginLit){
				animator.playBeginButtonAnimationR();
			}
		}
		
		if(animator.bishopAnimationActive==false&&animator.droidLit==false){
			if((typeof animator.bishopBox)!='undefined'){
				if(animator.bishopBox.contains(mousePos)){
					animator.playBishopAnimation();
				}
			}
		}else{
			if((typeof animator.bishopBox)!='undefined'){
				if(animator.bishopBox.contains(mousePos)==false&&animator.droidLit){
					animator.playBishopAnimationR();
				}
			}
		}
		
		if(animator.nowtroAnimationActive==false&&animator.nowtroLit==false){
			if((typeof animator.nowtroBox)!='undefined'){
				if(animator.nowtroBox.contains(mousePos)){
					animator.playNowtroAnimation();
				}
			}
		}else{
			if((typeof animator.nowtroBox)!='undefined'){
				if(animator.nowtroBox.contains(mousePos)==false&&animator.nowtroLit){
					animator.playNowtroAnimationR();
				}
			}
		}
		
		if((typeof helpBut.helpBox)!='undefined'){
			if(!animator.helpButtonLightAnimationActive&&!animator.helpButtonLit){
				if(helpBut.helpBox.contains(mousePos)){
					animator.playHelpButtonLightAnimation();
				}
			}else{
				if(!helpBut.helpBox.contains(mousePos)&&animator.helpButtonLit){
					animator.playHelpButtonLightAnimationR();
				}
			}
		}
		//Win the game if it has been won.
		if(inExitGroup&&gameStart&&thePlayer.insideMazeAbsolute()==false&&coreGrabbed&&currRings<=3){
			inExitGroup=false;
			roundWon = true;
			playerImmune = true;
		}
		
		
		
		if(playerImmune==false&&enterRevealed){	
			if(thePlayer.hasSphere()==false){
				if((enterSegGroup.contains(mousePos))&&(typeof paper.project.hitTest(mousePos).item.segments==='object')){
					theCursor.hideCursor();
					thePlayer.pickupPlayerSphere();
				}
			}
			//Intersection related actions.
			
			if(thePlayer.doesIntersect()){
				//Determine if the player is in the enter group before the start of the game.
				if(enterSegGroup.contains(mousePos)&&(gameStart==false)){
					inEntGroup = true;
				}
				//Determine if the player is in the exit group.
				if(exitSegGroup.contains(mousePos)){
					inExitGroup = true;
				}
				//Kill the player if they go back into the entrance zone.
				if(gameStart&&enterSegGroup.contains(mousePos)){
					gameLoss = true;
				}
				//If the player touches the maze group while the game is in play, kill the player.
				if(gameStart&&mazeGroup.contains(mousePos)){
					gameLoss = true;
				}
				if(Core.contains(mousePos)){
					coreGrabbed = true;
				}
			}
			
			
			//If the player has the sphere and is outside the maze without being in the exit or enter zones while the game has started, kill the player.
			if(thePlayer.hasSphere()&&thePlayer.insideMaze()==false&&exitSegGroup.contains(mousePos)==false&&enterSegGroup.contains(mousePos)==false&&gameStart){
				gameLoss = true;
			}
			//If the player has the sphere and is outside the maze without being in the exit or enter zones while the game has NOT started, drop the player and show cursor.
			if(thePlayer.hasSphere()&&thePlayer.insideMaze()==false&&exitSegGroup.contains(mousePos)==false&&enterSegGroup.contains(mousePos)==false&&gameStart==false){
				thePlayer.dropSphere();
				theCursor.showCursor();
			}
			
			//If the player does not have the sphere and enters the exit group. kill the player.
			if(inExitGroup && gameStart && !coreGrabbed){
				gameLoss = true;
			}
			
			if((inEntGroup)){
				if(enterSegGroup.contains(mousePos)==false){
					if(thePlayer.insideMaze()==true){
						gameStart=true;
						inEntGroup=false;
					}else{
						inEntGroup=false;
						thePlayer.dropSphere();
					}
				}
			}
			
			//Start the game, if not allready started.
			if(gameStart==true && allreadyStarted == false){
				animator.playEnteranceSeal();
				allreadyStarted = true;
			}
			
			
			//If core is grabbed, reveal exit.
			if(coreGrabbed == true && exitReveal == false && currRings<=3){
				exitSegGroup.fillColor.alpha = 0;
				exitSegGroup.strokeColor.alpha = 0;
				exitSegGroup.shadowBlur = 0;
				Core.remove();
				exitReveal = true;
			}
			
			if(thePlayer.insideVault()&&currRings>=4){
				roundWon = true;
				playerImmune = true;
			}
		}	
		//Send in next text char.
		dataTyper.nextChar();
		storyTyper.nextChar();
		if(inMenu){
			//theUI.titleText.nextChar();
		}
		
		//Have story manager read gamestate.
		theStoryteller.readGameState(gameStart,roundWon,gameLoss,currRings,roundCount);
		
		//End of round gamestates
		
		if(gameLoss){
			thePlayer.kill(theShaker);
			/**
			if(roundCount>=5){
				roundCount = 5;
			}else{
				roundCount = 0;
			}
			**/
			//Since the gamestate changed, have the story manager check the gamestate.
			theStoryteller.readGameState(gameStart,roundWon,gameLoss,currRings,roundCount);
			//Reset the game
			gameLoss = false;
			theMaze.generateMaze();
			theMaze.drawMaze(mazeCenter.x,mazeCenter.y,2,20,64);
			gameStart = false;
			allreadyStarted = false;
			coreGrabbed = false;
			exitReveal = false;
			enterRevealed = false;
			theUI.removeHider();
			theUI.drawHider();
			theCursor.sendCursorToFront();
			theMaze.sendEntranceToFront();
			//paintTrail.remove();
			//thePlayer.paint();
		}
		if(roundWon){
			if(roundCount>=9&&currRings!=4){
				if(actTransitionPlayed==false){
					animator.playActTransition();
					gameStart = false;
					actTransitionPlayed=true;
					playerImmune = true;
				}
				if(animator.isActTransitionActive()==false){
					roundCount=0;
					currRings++
					//Reset the game
					theDet.detColor();
					theMaze.generateMaze();
					theMaze.drawMaze(mazeCenter.x,mazeCenter.y,2,20,64);
					theUI.removeHider();
					theUI.drawHider();
					theMaze.moveMaze(0,-5000);
					theUI.setHiderPos(-5000);
					theCursor.sendCursorToFront();
					theMaze.sendEntranceToFront();
					thePlayer.dropSphere();
					roundWon = false;
					enterRevealed = false;
					roundTransitionPlayed=false;
					actMazeRevealPlayed=false;
					allreadyStarted = false;
					coreGrabbed = false;
					exitReveal = false;
					theStoryteller.clear();
					needMazeReveal = true;
					actTransitionPlayed = false;
				}
			}else{
				if(roundCount>=19&&currRings==4){
					animator.playOutro();
					playerImmune=true;
					roundWon = false;
				}else{
					if(roundTransitionPlayed==false){
					if(currRings!=4){
						animator.playRoundTransition();
					}else{
						animator.playFinaleRoundTransition();
					}
					gameStart = false;
					roundTransitionPlayed=true;
					playerImmune = true;
				}
					if((animator.isRoundTransitionActive()==false&&currRings<=3)||(animator.finaleRoundTransitionActive==false&&currRings>=4)){
						//Since the gamestate changed, have the story manager check the gamestate.
						theStoryteller.readGameState(gameStart,roundWon,gameLoss,currRings,roundCount);
						roundCount = roundCount + 1;
						//Reset the game
						theMaze.generateMaze();
						theMaze.drawMaze(mazeCenter.x,mazeCenter.y,2,20,64);
						roundWon = false;
						enterRevealed = false;
						roundTransitionPlayed=false;
						allreadyStarted = false;
						coreGrabbed = false;
						exitReveal = false;
						//playerImmune = false;
						theStoryteller.clear();
						thePlayer.dropSphere();
						theUI.removeHider();
						theUI.drawHider();
						theCursor.sendCursorToFront();
						theMaze.sendEntranceToFront();
					}
				}
			}	
		}
		if(needMazeReveal&&animator.isActMazeRevealActive()==false){
			animator.playActMazeReveal();
			needMazeReveal=false;
			mazeRevealPlayed=true;
		}
		if(mazeRevealPlayed=true&&animator.isActMazeRevealActive()==false&&animator.outroActive==false&&enterRevealed){
			playerImmune=false;
			mazeRevealPlayed=false;
		}
		
		theCursor.sendCursorToFront();
		
		paper.view.update();
	}
	
}

