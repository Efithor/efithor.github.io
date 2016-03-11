//Method to call the star draw method after a mouseclick.
var interfaceObj = function(){
	 this.selectorY = 0;
	 this.mouseX = 0;
};

interfaceObj.prototype.drawSelector = function(){
	renderer.drawCircle(Math.floor(845.73*Math.pow((Math.E),(-0.00007*7521.79728990999))),Math.floor(-19.54*Math.log(818.972700888853)+315),'white',true,true);
}

interfaceObj.prototype.moveSelector = function(mouseX){
	this.mouseX = mouseX;
	this.selectorY = 0.0055*Math.pow(this.mouseX,2) - 5.6315*this.mouseX + 1632;
	renderer.moveCircle(0,this.mouseX,this.selectorY,true);
}
