var NodeText;
var OrangeText;
var theMaze;
var mazeSpeed = 0.3;
var currRings = 2;
var segments = [];
var walls = [];
var mazeGroup;
var enterZone;
var exitZone;
var enterSeg = [];
var exitSeg = [];
var enterSegGroup;
var exitSegGroup;
var readArray = [];
var ringSep = 12;
var ringThickness = 4;
var Core;
var testerArray = [];
var Color = 'orange';
var blurVal = 12;
var mazeCenter;
var typeSize = 100;

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
		Core = new paper.Path.Circle(new paper.Point(coreX, coreY), 5);
		if(currRings==4&&roundCount != 19){
			Core.fillColor = 'white';
			Core.strokeColor = 'white';
			Core.shadowColor = 'white';
		}else{
			Core.fillColor = Color;
			Core.strokeColor = Color;
			Core.shadowColor = Color;
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
		mazeGroup.fillColor = Color;
		mazeGroup.strokeColor = Color;
		mazeGroup.closed = true;
		mazeGroup.shadowColor = Color;
		mazeGroup.shadowBlur = blurVal;
		
		/**
		enterSegGroup.closed = true;
		enterSegGroup.selected = false;
		enterSegGroup.shadowColor = Color;
		enterSegGroup.shadowBlur = blurVal;
		enterSegGroup.fillColor = Color;
		enterSegGroup.strokeColor = Color;
		enterSegGroup.shadowColor = Color;
		
		exitSegGroup.closed = true;
		exitSegGroup.selected = false;
		exitSegGroup.fillColor = Color;
		exitSegGroup.strokeColor = Color;
		exitSegGroup.shadowColor = Color;
		exitSegGroup.shadowBlur = blurVal;
		**/
		
		//Draw walls and rotate the wall into the correct position.
		for (var i=0;i<walls.length;i++){
			if(walls[i]==true){
				walls[i]=this.drawWall(this.segToRing(i),5,ringSep,ringThickness);
				walls[i].rotate(-(45/Math.pow(2,this.segToRing(i)))*(i-this.ringBorder(this.segToRing(i),true)),mazeCenter);
				mazeGroup.addChild(walls[i]);
			}
		}
	}
	/**
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
	**/
	//Draws a basic segment. 
	/**
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
	**/
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
		//console.log("Drawing wall!");
		var rect = new paper.Rectangle(mazeCenter.x-(thickness/2),mazeCenter.y+(ringSep*ringNum),thickness,ringSep+ringThickness);
		var rectPath = new paper.Path.Rectangle(rect);
		rectPath.fillColor = Color;
		rectPath.strokeColor = Color;
		rectPath.selected = false;
		rectPath.shadowColor = Color;
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

window.onload = function(){
	//Get and setup canvas.
	var canvas = document.getElementById('logoCanvas');
	paper.setup(canvas);
	mazeCenter = new paper.Point(220,52);
	
	NodeText = new paper.PointText(new paper.Point(0,80));
	NodeText.fillColor = Color;
	NodeText.fontFamily = 'VT323';
	NodeText.fontSize = typeSize;
	NodeText.shadowColor = Color;
	NodeText.shadowBlur = blurVal;
	NodeText.content = 'NODE';
	
	OrangeText = new paper.PointText(new paper.Point(260,80));
	OrangeText.fillColor = Color;
	OrangeText.fontFamily = 'VT323';
	OrangeText.fontSize = typeSize;
	OrangeText.shadowColor = Color;
	OrangeText.shadowBlur = blurVal;
	OrangeText.content = 'RANGE';
	
	theMaze = new maze();
	theMaze.generateMaze();
	theMaze.drawMaze(mazeCenter.x,mazeCenter.y,5,ringThickness,ringSep);
	
	paper.view.onFrame = function(event){
		theMaze.rotateMaze(mazeSpeed);
	
	}

}