//TaskList:
//Isocrone UI X
//Time Control X
//Infobox
//Color Star
//Refs
//Spruce things up.



//Call the renderObject's canvas setup method.
//Call the backgroundObj's initialize grid method and the starObj's method due to a mouse click from the interface object.

//Globals
var pathArrayCode;
pathArrayCode = 0;
pathArray = new Array(1); 

var starArrayCode;
starArrayCode = 0;
starArray = new Array(1);

var ZAMSArray;
ZAMSArray = new Array(1);

var simSpeed = 1000;

var goForAnimate = false;
	
window.onload = function(){
	renderer = new renderObject();
	var tool = new paper.Tool();
	var backdrop = new backgroundObj;
	var iObj = new interfaceObj;
	renderer.setupCanvas();
	backdrop.drawBackground();
	backdrop.drawAxes();
	backdrop.labelTemp();
	backdrop.labelLumen();
	backdrop.starGrad();
	backdrop.gradLabel();
	backdrop.drawZAMS(); 
	backdrop.drawUI();
	iObj.drawSelector();

	paper.view.onFrame = function(event){ //Animate
		if (goForAnimate == true){
			for ( i = 0; i < starArrayCode; i++){
				this.i = i;
				starArray[i].moveStar();
			}
			i=0;
		}
		renderer.updateSpeedText();
	}
	
	tool.onMouseDown = function(event){
		if(event.point.x>=499 && event.point.x<=547){
			
			var star = new starObj(event.point.x, event.point.y, starArrayCode, 0, 7.00,499-event.point.x,183-(0.0055*Math.pow(event.point.x,2) - 5.6315*event.point.x + 1632));
			star.drawStar(starArrayCode,event.point.x, event.point.y, false);
			starArray[starArrayCode] = star;
			starArrayCode++;
		}
		if(event.point.x>547 && event.point.x<=610){
			var star = new starObj(event.point.x, event.point.y, starArrayCode, 0, 5.00,595-event.point.x,221-(0.0055*Math.pow(event.point.x,2) - 5.6315*event.point.x + 1632));
			star.drawStar(starArrayCode,event.point.x, event.point.y, false);
			starArray[starArrayCode] = star;
			starArrayCode++;
		}
		if(event.point.x>610 && event.point.x<=626){
			var star = new starObj(event.point.x, event.point.y, starArrayCode, 0, 3.00,626-event.point.x,238-(0.0055*Math.pow(event.point.x,2) - 5.6315*event.point.x + 1632));
			star.drawStar(starArrayCode,event.point.x, event.point.y, false);
			starArray[starArrayCode] = star;
			starArrayCode++;
		}
		if(event.point.x>627 && event.point.x<=631){
			var star = new starObj(event.point.x, event.point.y, starArrayCode, 0, 2.00,627-event.point.x,249-(0.0055*Math.pow(event.point.x,2) - 5.6315*event.point.x + 1632));
			star.drawStar(starArrayCode,event.point.x, event.point.y, false);
			starArray[starArrayCode] = star;
			starArrayCode++;
		}
		if(event.point.x>631 && event.point.x<=636){
			var star = new starObj(event.point.x, event.point.y, starArrayCode, 0, 1.00,636-event.point.x,271-(0.0055*Math.pow(event.point.x,2) - 5.6315*event.point.x + 1632));
			star.drawStar(starArrayCode,event.point.x, event.point.y, false);
			starArray[starArrayCode] = star;
			starArrayCode++;
		}
		if(event.point.x>=827 && event.point.x<=857 && event.point.y>=60 && event.point.y<=90 && simSpeed > 100){
			simSpeed = simSpeed/10;
		}
		if(event.point.x>=867 && event.point.x<=897 && event.point.y>=60 && event.point.y<=90 && simSpeed < 100000000){
			simSpeed = simSpeed*10;
		}
	};
	tool.onMouseMove = function(event){
		if(event.point.x>Math.floor(845.73*Math.pow((Math.E),(-0.00007*7521.797))) && event.point.x < Math.floor(845.73*Math.pow((Math.E),(-0.00007*4062.6)))){
			iObj.moveSelector(event.point.x);
			renderer.updateMassText(event.point.x,0.0055*Math.pow(event.point.x,2) - 5.6315*event.point.x + 1632,(-0.0000115884634044432*Math.pow(event.point.x,3) + 0.0194811485629059*Math.pow(event.point.x,2) - 10.9043479219472*event.point.x + 2037.32801226574))
		}
	};
};

