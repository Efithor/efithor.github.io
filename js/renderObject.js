var renderObject = function(){
	this.selectorPath;
	this.speedText;
	this.massText;
	};
	

	
	//Draw line method
	renderObject.prototype.drawLine = function(x1,y1,x2,y2,color){
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.color = color;
		var line = new paper.Path();
		line.strokeColor = this.color;
		line.add(new paper.Point(x1,y1));
		line.add(new paper.Point(x2,y2));
		paper.view.update();
		
	};
	//Draw text
	renderObject.prototype.drawText = function(content,x,y,color,size,speedUpdate,isMassText,rotation){
		this.content = content;
		this.x = x;
		this.y = y;
		this.color = color;
		this.speedUpdate = speedUpdate;
		this.isMassText = isMassText;
		this.rotation = rotation;
		var textQ = new paper.PointText(new paper.Point(x,y));
		textQ.content = content;
		textQ.fillColor = color;
		if(size != null){
			textQ.scaling = size;
		}
		if(rotation != null){
			textQ.rotation = this.rotation;
		}
		if(this.speedUpdate==true){
			this.speedText = textQ;
//			speedUpdate = false;
		}
		if(this.isMassText==true){
			this.massText = textQ;
//			isMassText = false;
		}
		paper.view.update();
	};
	//Update Speed Text
	renderObject.prototype.updateSpeedText = function(){
		this.speedText.content = simSpeed;
		if(simSpeed == 100000000){
			this.speedText.content = this.speedText.content +' (Max)';
		}
		if(simSpeed == 100){
			this.speedText.content = this.speedText.content +' (Min)'
		}
	}
	//Update Mass Text
	renderObject.prototype.updateMassText = function(xMass, yMass, contentM){
		this.xMass = xMass;
		this.yMass = yMass;
		this.contentM = contentM;
		this.contentM = this.contentM.toFixed(2);
		this.massText.content = this.contentM + ' Mo';
		this.massText.position = new paper.Point(this.xMass+25,this.yMass-10);
		
	}
	//Draw rectangle
	renderObject.prototype.drawRectangle = function(x1,y1,x2,y2,color,stroke){
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.color = color;
		this.stroke = stroke;
		var rectangle = new paper.Rectangle(new paper.Point(x1,y1), new paper.Point(x2,y2));
		var path = new paper.Path.Rectangle(rectangle);
		path.fillColor = color;
		path.strokeColor = stroke;
		paper.view.update();
	};
	//Draw gradient
	renderObject.prototype.drawGradient = function(x1,y1,x2,y2){
		var topLeft =  [x1, y1];
		var bottomRight = [x2, y2];
		var path = new paper.Path.Rectangle({
			topLeft: topLeft,
			bottomRight: bottomRight,
			fillColor: {
				gradient: {
				stops: [['blue',0.07],['#66ccff',0.4],['white',0.65],['yellow',0.75], ['red',0.9]]
			},
				origin: topLeft,
				destination: bottomRight
		}
		});
		paper.view.update();
	}
	//Draw circle with gradient shading.
	renderObject.prototype.drawCircle = function(x,y, color, zams, selector,size){
		var x = x;
		var y = y;
		var grad = grad;
		var color = color;
		var zams = zams;
		var size = size;
//		var offset = 0;
//		var offset = y - ((0.8010680908)*x+51);
//		console.log(offset);
		var Path = new paper.Path.Circle(new paper.Point(x, y), 4);
		if(x <= 196){
			Path.fillColor = 'blue';
		}
		if(x > 196 && x <= 437){
			Path.fillColor = '#66ccff';
		}
		if(x > 437 && x <= 529){
			Path.fillColor = 'white';
		}
		if(x > 529 && x <= 599){
			Path.fillColor = 'yellow';
		}
		if(x > 599 && x <= 661){
			Path.fillColor = 'orange';
		}
		if(x > 661){
			Path.fillColor = 'red';
		}
//		if (grad == true){
//			console.log(offset);
//			Path.fillColor = {
//				gradient: {
//				stops: [['blue',0.07],['#66ccff',0.4],['white',0.65],['yellow',0.75], ['red',0.9]],
//				radial: false
//			},
//				origin: (51,0),
//				destination: (800,600)
//			}
//		};
		if(zams == false){
			pathArray[pathArrayCode] = Path;
			pathArrayCode++;
			goForAnimate = true;
		}
		if(selector == true){
			selectorPath = Path;
			selectorPath.fillColor = 'green';
		}

		paper.view.update();
	}
	//Move circle
	renderObject.prototype.moveCircle = function(ID, xP, yP, selector){
		var ID = ID;
		var x = xP;
		var y = yP;
		var selector = selector;
//		console.log(pathArray[ID]);
//		console.log(xP);
//		console.log(yP);
		if(selector){
			selectorPath.position = new paper.Point(x,y);
		}else{
			pathArray[ID].position = new paper.Point(x, y);
			if(x <= 196){
				pathArray[ID].fillColor = 'blue';
			}
			if(x > 196 && x <= 437){
				pathArray[ID].fillColor = '#66ccff';
			}
			if(x > 437 && x <= 529){
				pathArray[ID].fillColor = 'white';
			}
			if(x > 529 && x <= 599){
				pathArray[ID].fillColor = 'yellow';
			}
			if(x > 599 && x <= 661){
				pathArray[ID].fillColor = 'orange';
			}
			if(x > 661){
				pathArray[ID].fillColor = 'red';
			}			
		}
		if(selector){
			selectorPath.fillColor = 'green';
		}
	}
	//Dynamically Color Stars
	renderObject.prototype.colorCircle = function(ID, color){
		var ID = ID;
		var color = color;
		pathArray[ID].fillColor = color;
	}
	//Delete stars once they get too old.
	renderObject.prototype.deleteStar = function(ID){
		this.ID = ID;
		pathArray[ID].remove();
	}

	//Setup canvas
	renderObject.prototype.setupCanvas = function(){
		var canvas = document.getElementById('myCanvas');
		paper.setup(canvas);
	};



