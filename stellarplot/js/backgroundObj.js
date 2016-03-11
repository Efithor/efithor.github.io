//Class that sets up and maintains the background by utilizing a variety of methods.
var backgroundObj = function(){};
	
	//Draw black background.
	backgroundObj.prototype.drawBackground = function(){
		renderer.drawRectangle(0,0,1100,700,'black');
	};
	//Draw the axes. The lines leave a 50 px margin from the edge.
	backgroundObj.prototype.drawAxes = function(){
		renderer.drawLine(0,550,800,550, 'white');
		renderer.drawLine(50,0,50,600, 'white');
		renderer.drawLine(800,0,800,600,'white');
	};
	//Label bottom axis with temps. Governed by the function px = (845.73e^(-0.00007)T)
	backgroundObj.prototype.labelTemp = function(){
		var threeKTempX = Math.floor(845.73*Math.pow((Math.E),(-0.00007*3000)));
		var sixKTempX = Math.floor(845.73*Math.pow((Math.E),(-0.00007*6000)));
		var tenKTempX = Math.floor(845.73*Math.pow((Math.E),(-0.00007*10000)));
		var thirtyKTempX = Math.floor(845.73*Math.pow((Math.E),(-0.00007*30000)));
		renderer.drawText("3000",threeKTempX,590, 'white');
		renderer.drawText("6000",sixKTempX,590, 'white');
		renderer.drawText("10,000",tenKTempX,590, 'white');
		renderer.drawText("30,000",thirtyKTempX,590, 'white');
		
		renderer.drawText("Surface Temperature (Degrees Kelvin)",330,620,"white");
	};
	//Label side axis with lumenocity. Governed by the function px = -19.54ln(L)+315
	backgroundObj.prototype.labelLumen = function(){
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(1000000)+315), 'white');
		renderer.drawText("6", 17+14, Math.floor(-19.54*Math.log(1000000)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(100000)+315), 'white');
		renderer.drawText("5", 17+14, Math.floor(-19.54*Math.log(100000)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(10000)+315), 'white');
		renderer.drawText("4", 17+14, Math.floor(-19.54*Math.log(10000)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(1000)+315), 'white');
		renderer.drawText("3", 17+14, Math.floor(-19.54*Math.log(1000)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(100)+315), 'white');
		renderer.drawText("2", 17+14, Math.floor(-19.54*Math.log(100)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(10)+315), 'white');
		renderer.drawText("1", 17, Math.floor(-19.54*Math.log(1)+315), 'white');
		renderer.drawText("0.1", 17, Math.floor(-19.54*Math.log(0.1)+315), 'white');
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(0.01)+315), 'white');
		renderer.drawText("-2", 17+14, Math.floor(-19.54*Math.log(0.01)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(0.001)+315), 'white');
		renderer.drawText("-3", 17+14, Math.floor(-19.54*Math.log(0.001)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(0.0001)+315), 'white');
		renderer.drawText("-4", 17+14, Math.floor(-19.54*Math.log(0.0001)+315)-8, 'white',0.8);
		
		renderer.drawText("10", 17, Math.floor(-19.54*Math.log(0.00001)+315), 'white');
		renderer.drawText("-5", 17+14, Math.floor(-19.54*Math.log(0.00001)+315)-8, 'white',0.8);
		
		renderer.drawText("Luminocity (Solar Units)",-56,315,'white',1,false,false,-90);

	};
	//Draw the star color gradient.
	backgroundObj.prototype.starGrad = function(){
		renderer.drawGradient(51,550,800,570);
	}
	//Label the gradient bar.
	backgroundObj.prototype.gradLabel = function(){
		renderer.drawText("O",Math.floor(845.73*Math.pow((Math.E),(-0.00007*30000))),564,'white');
		renderer.drawText("B",Math.floor(845.73*Math.pow((Math.E),(-0.00007*20000))),564,'white');
		renderer.drawText("A",Math.floor(845.73*Math.pow((Math.E),(-0.00007*8200))),564,'black');
		renderer.drawText("F",Math.floor(845.73*Math.pow((Math.E),(-0.00007*6750))),564,'black');
		renderer.drawText("G",Math.floor(845.73*Math.pow((Math.E),(-0.00007*5600))),
		564,'black');
		renderer.drawText("K",Math.floor(845.73*Math.pow((Math.E),(-0.00007*4500))),564,'black');
		renderer.drawText("M",Math.floor(845.73*Math.pow((Math.E),(-0.00007*3500))),564,'black');
	}
	//Draw lines of constant radius
	backgroundObj.prototype.conRadLineDraw = function(){
		renderer.drawLine(51,426,419,550, 'white');
		renderer.drawLine(51,150,1192, 550, 'white');
		//renderer.drawLine(150,0,1482, 550, 'white');
	}	
	backgroundObj.prototype.drawZAMS = function(){
		var ZStar = new starObj(0, 0, 900);
		ZAMSArray[900] = ZStar;
		ZAMSArray[900].drawStar(900,69,82,true);
		
		var ZStar = new starObj(0, 0, 901);
		ZAMSArray[901] = ZStar;
		ZAMSArray[901].drawStar(901,103,111,true);
		
		var ZStar = new starObj(0, 0, 902);
		ZAMSArray[902] = ZStar;
		ZAMSArray[902].drawStar(902,103,111,true);
		
		var ZStar = new starObj(0, 0, 903);
		ZAMSArray[903] = ZStar;
		ZAMSArray[903].drawStar(903,Math.floor(845.73*Math.pow((Math.E),(-0.00007*25400))),Math.floor(-19.54*Math.log(9950)+315),true);
		
		var i = 0;
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*20900))),Math.floor(-19.54*Math.log(2920)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*18800))),Math.floor(-19.54*Math.log(1580)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*15200))),Math.floor(-19.54*Math.log(480)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*13700))),Math.floor(-19.54*Math.log(272)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*12500))),Math.floor(-19.54*Math.log(160)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*11400))),Math.floor(-19.54*Math.log(96.7)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*10500))),Math.floor(-19.54*Math.log(60.7)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*9800))),Math.floor(-19.54*Math.log(39.4)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*9400))),Math.floor(-19.54*Math.log(30.3)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*9020))),Math.floor(-19.54*Math.log(23.6)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*8190))),Math.floor(-19.54*Math.log(12.3)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*7600))),Math.floor(-19.54*Math.log(7.13)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*7300))),Math.floor(-19.54*Math.log(5.21)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*7050))),Math.floor(-19.54*Math.log(3.89)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*6650))),Math.floor(-19.54*Math.log(2.56)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*6250))),Math.floor(-19.54*Math.log(1.68)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*5940))),Math.floor(-19.54*Math.log(1.25)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*5790))),Math.floor(-19.54*Math.log(1.07)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*5777))),Math.floor(-19.54*Math.log(1)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*5310))),Math.floor(-19.54*Math.log(0.96)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*5150))),Math.floor(-19.54*Math.log(0.552)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*4990))),Math.floor(-19.54*Math.log(0.461)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*4690))),Math.floor(-19.54*Math.log(0.318)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*4540))),Math.floor(-19.54*Math.log(0.263)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*4410))),Math.floor(-19.54*Math.log(0.216)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*4150))),Math.floor(-19.54*Math.log(0.145)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3840))),Math.floor(-19.54*Math.log(0.077)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3660))),Math.floor(-19.54*Math.log(0.050)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3520))),Math.floor(-19.54*Math.log(0.032)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3400))),Math.floor(-19.54*Math.log(0.020)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3290))),Math.floor(-19.54*Math.log(0.013)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3170))),Math.floor(-19.54*Math.log(0.0076)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,Math.floor(845.73*Math.pow((Math.E),(-0.00007*3030))),Math.floor(-19.54*Math.log(0.0044)+315),true);
		
		i = i+1;
		var ZStar = new starObj(0, 0, 903+i);
		ZAMSArray[903+i] = ZStar;
		ZAMSArray[903+i].drawStar(903+i,(Math.floor(845.73*Math.pow((Math.E),(-0.00007*2860)))),(Math.floor(-19.54*Math.log(0.0025)+315)),true);
		
	}
	backgroundObj.prototype.drawUI = function(){
	renderer.drawText('Simulation Speed',812,50,'white');	
	renderer.drawRectangle(827,60,857,90,'black','white');
	renderer.drawText('÷10',832,79,'white',1);
	renderer.drawRectangle(867,60,897,90,'black','white');
	renderer.drawText('x10',872,79,'white',1);
	
	renderer.drawText('Current Speed:',821,110,'white');
	renderer.drawText('Sim Years/Sec',821,150,'white');	
	renderer.drawText(simSpeed,821,130,'white',1,true);
	renderer.drawText('7.00',499,183,'white',1,false,true);
	}
	