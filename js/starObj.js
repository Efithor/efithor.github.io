var starObj = function(starX, starY, ID, age, mass, offsetX, offsetY){
	this.starX = starX;
	this.starY = starY;
	this.age = 124045;
	this.ID = ID;
	this.StarT = 0; //This star object's temp. In Kelvins.
	this.mass = mass;
	this.StrtL = 0;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.ageStar = true;
	
};
//Method that calls the renderObject to draw a line.

//Method that calls the renderObject to draw a circle. Used by interface whenever the mouse is clicked.
	starObj.prototype.drawStar = function(ID,x,y, zams){
		this.ID = ID;
		this.starX = x;
		this.starY = y;
		this.zams = zams;
		renderer.drawCircle(this.starX,this.starY, "white", zams);
	}
	
	starObj.prototype.moveStar = function(){
		var M = 5;
		var u = 1;
		var K = 4000; 
		if(this.ageStar == true){
				this.age = this.age+simSpeed; //Time is in years.
		}else{
			renderer.deleteStar(this.ID);
		}
		if(this.mass == 7.00){
			//Pre Main Sequnce
			//Determine Lum
			if(this.age > 17755 && this.age <= 255503){
				this.StrtL = -0.000000000000000000000058200598*Math.pow(this.age,5) + 0.000000000000000027005658582123*Math.pow(this.age,4) - 0.000000000003543625371143290000*Math.pow(this.age,3) + 0.00000010436400345953*Math.pow(this.age,2) + 0.009660613201983040000000000000*this.age + 93.809062892448700000000000000000;
			}
			if(this.age > 255503 && this.age <= 445014){
				this.StrtL = -0.000000000000000000000224937722*Math.pow(this.age,5) + 0.000000000000000395935440460306*Math.pow(this.age,4) - 0.000000000275962086074091000000*Math.pow(this.age,3) + 0.0000951534680007201*Math.pow(this.age,2) - 16.2255031087403*this.age + 1096405.6721449;
			}
			if(this.age > 445014 && this.age <= 901246){
				this.StrtL = -0.000000000000000245043729714981*Math.pow(this.age,3) + 0.000000000590575068556054*Math.pow(this.age,2) - 0.000469889111370576*this.age + 1924.540652606;
			}
			//Determine Temp
			if(this.age > 17755 && this.age <= 357979){
				this.StarT = 0.000000000000000000000095661213*Math.pow(this.age,5) - 0.000000000000000089622032047693*Math.pow(this.age,4) + 0.0000000000289110490537236*Math.pow(this.age,3) - 0.000003686372100052780000000000*Math.pow(this.age,2) + 0.215377882997877*this.age + 755.336416647859;
			}
			if(this.age >357979 && this.age <= 901246){
				this.StarT= -0.000000000000000000000000057915*Math.pow(this.age,5) + 0.00000000000000000018870567287*Math.pow(this.age,4) - 0.000000000000241497841142190000*Math.pow(this.age,3) + 0.000000151538667532911*Math.pow(this.age,2) - 0.046758800368998*this.age + 26887.8345003961;
			}
			//Post MS
			//Determine Lum
			if(this.age > 901246 && this.age <= 42500000){
				this.StrtL = 0.000000000001269205722849320000*Math.pow(this.age,2) - 0.00000232175329624106*Math.pow(this.age,1) + 1865.90191012899;
			}			
			if(this.age > 42500000 && this.age <= 43338810){
				this.StrtL = -0.000000000001453178867464560000*Math.pow(this.age,3) + 0.000188305258324599*Math.pow(this.age,2) - 8133.61706181933*this.age + 117107015476.413;
			}
			if(this.age > 43338810 && this.age <= 46395120){
				this.StrtL = -0.000000000000000000000934151934*Math.pow(this.age,4) + 0.000000000000167948877892547*Math.pow(this.age,3) - 0.0000113195658652341*Math.pow(this.age,2) + 338.969563137379*this.age - 3805240214.21224;
			}
			if(this.age > 46395120 && this.age <= 48391580){
				this.StrtL = 0.000000000000000000041789465709*Math.pow(this.age,4) - 0.00000000000794745668630685*Math.pow(this.age,3) + 0.000566771457841276*Math.pow(this.age,2) - 17963.561434069*this.age + 213498776151.496;
			}
			//Determine Temp
			if(this.age > 901246 && this.age <= 42460670){
				this.StarT = -0.000000000002998255960263600000*Math.pow(this.age,2) + 0.0000341133398890041*this.age + 20704.7169907394;
			}
			if(this.age > 42460670 && this.age <= 43430380){
				this.StarT = 0.00000000000213253020826468*Math.pow(this.age,3) - 0.000276847155228659000000000000*Math.pow(this.age,2) + 11980.0886395078*this.age - 172804505708.769;
			}
			if(this.age > 43430380 && this.age <= 45676950){
				this.StarT = 0.000000000000000000000000000137*Math.pow(this.age,5) - 0.000000000000000000030463866332*Math.pow(this.age,4) + 0.00000000000270637218522824*Math.pow(this.age,3) - 0.000120204049445733*Math.pow(this.age,2) + 2669.19160324834*this.age - 23706062435.8665;
			}
			if(this.age > 45676950 && this.age <= 47749080){
				this.StarT = 0.000000000000000000000000003703*Math.pow(this.age,5) - 0.000000000000000000869143645631*Math.pow(this.age,4) + 0.0000000000815916413446228*Math.pow(this.age,3) - 0.00382948815489992*Math.pow(this.age,2) + 89862.1628720212*this.age - 843420561579.294;
			}
			if(this.age > 47749080 && this.age <= 48391580){
				this.StarT = 0.000000000000000000000000047245*Math.pow(this.age,5) - 0.000000000000000011357206296199*Math.pow(this.age,4) + 0.000000001092056094023350000000*Math.pow(this.age,3) - 0.0525032092683646*Math.pow(this.age,2) + 1262101.377358530000000000000000000000*this.age - 12135568287277.1;
			}
			if(this.age > 48391580){
				this.ageStar = false;
			}
		}
		if(this.mass == 5){
			//Premain
			//Lum
			if(this.age > 28909.5226 && this.age <= 598025.7164){
				this.StrtL = 0.00000000000000910580036000547*Math.pow(this.age,3) - 0.00000000465693215933826*Math.pow(this.age,2) + 0.00078937174379045*this.age + 78.988362432564;
			}
			if(this.age > 598025.7164 && this.age <= 898515.0378){
				this.StrtL = 0.000000000000000000000012615469*Math.pow(this.age,5) - 0.000000000000000048059738348929*Math.pow(this.age,4) + 0.0000000000728066067557541*Math.pow(this.age,3) - 0.0000548123544531518*Math.pow(this.age,2) + 20.5022948589169*this.age - 3046792.78270158;
			}
			if(this.age > 898515.0378 && this.age <=978214.5089){
				this.StrtL = 0.000000000000000000000005610199*Math.pow(this.age,5) - 0.000000000000000025781645310345*Math.pow(this.age,4) + 0.000000000047286791545464100000*Math.pow(this.age,3) - 0.000043258554689503700000000000*Math.pow(this.age,2) + 19.732654743486100000000000000000*this.age - 3588886.33581047;
			}
			if(this.age > 978214.5089 && this.age <= 79896473.37){
				this.StrtL = 0.000000000000000000000000000157*Math.pow(this.age,4) - 0.000000000000000000022594494407*Math.pow(this.age,3) + 0.00000000000102601286000552*Math.pow(this.age,2) - 0.0000112342190191667*this.age + 566.583572114576;
			}
			//Temp
			
			if(this.age > 28909.5226 && this.age <= 1022752.43){
				this.StarT = 0.000000000000000000000000447111*Math.pow(this.age,5) - 0.000000000000000001201810366143*Math.pow(this.age,4) + 0.00000000000109697818896469*Math.pow(this.age,3) - 0.000000380276465769275*Math.pow(this.age,2) + 0.0529187239618605*this.age + 2471.21307924019;
			}
			if(this.age > 1022752.43 && this.age <= 79896473.37){
				this.StarT = 0.000000000000000000000000000804*Math.pow(this.age,4) - 0.000000000000000000124289287903*Math.pow(this.age,3) + 0.00000000000574416232052862*Math.pow(this.age,2) - 0.000112522441438262*this.age + 17442.5339677577;
			}
			//PostMain
			//Lum
			if(this.age > 79177050 && this.age <= 94573540){
				this.StrtL = 0.000000000000000000000000144098*Math.pow(this.age,4) - 0.000000000000000049817144284932*Math.pow(this.age,3) + 0.000000006451146354912990000000*Math.pow(this.age,2) - 0.37084713594508*Math.pow(this.age,1) + 7985481.62238326;
			}
			if(this.age > 94573540 && this.age <= 94921760){
				this.StrtL == 0.000000000000000000069267336833*Math.pow(this.age,4) - 0.0000000000262798341258141*Math.pow(this.age,3) + 0.00373891846347734*Math.pow(this.age,2) - 236420.339753896*Math.pow(this.age,1) + 5605998050333.17;
			}
			if(this.age > 94921760 && this.age <= 100887500){
				this.StrtL = 0.000000000000000000000000000018*Math.pow(this.age,5) - 0.000000000000000000008724368151*Math.pow(this.age,4) + 0.00000000000171618229460138*Math.pow(this.age,3) - 0.000168779823926957*Math.pow(this.age,2) + 8298.60092585542*Math.pow(this.age,1) - 163194682393.792;
			}
			if(this.age > 100887500 && this.age <= 108453800){
				this.StrtL = 0.000000000000000000000000000014*Math.pow(this.age,5) - 0.000000000000000000007293664345*Math.pow(this.age,4) + 0.00000000000151977295535401*Math.pow(this.age,3) - 0.000158314904064142*Math.pow(this.age,2) + 8244.7047023381*Math.pow(this.age,1) - 171723082178.794;
			}
			//Temp
			if(this.age > 79177050 && this.age <= 94470480){
				this.StarT = 0.000000000000000000000001070645*Math.pow(this.age,4) - 0.000000000000000369656149912600*Math.pow(this.age,3) + 0.0000000478056193982859*Math.pow(this.age,2) - 2.74463090790778*Math.pow(this.age,1) + 59039011.0852411;
			}
			if(this.age > 94470480 && this.age <= 97765680){
				this.StarT = 0.000000000000000000001207053982*Math.pow(this.age,4) - 0.000000000000465932736350587*Math.pow(this.age,3) + 0.0000674429203943969*Math.pow(this.age,2) - 4338.62693102498*Math.pow(this.age,1) + 104660985580.114;
			}
			if(this.age > 97765680 && this.age <= 108453800){
				this.StarT = -0.000000000000000000000000714658*Math.pow(this.age,4) + 0.000000000000000292857445791680*Math.pow(this.age,3) - 0.0000000450083407044345*Math.pow(this.age,2) + 3.0746568120314*Math.pow(this.age,1) - 78769311.9090126;
			}
			if(this.age > 108453800){
				this.ageStar = false;
			}
		}
		if(this.mass == 3){
			//PreMain
			//Determine Lum
			if(this.age >  94040.7686 && this.age <= 2766333.78){
				this.StrtL = 0.000000000000000000000014780811*Math.pow(this.age,4) - 0.000000000000000078290147536507*Math.pow(this.age,3) + 0.000000000171273331791593*Math.pow(this.age,2) - 0.000163857638693288*this.age + 68.6827252647642;
			}		
			if(this.age > 2766333.78 && this.age <= 3707612.093){
				this.StrtL = 0.000000000000000000000165705742*Math.pow(this.age,4) - 0.00000000000000279950075654114*Math.pow(this.age,3) + 0.0000000168319017401483*Math.pow(this.age,2) - 0.0433635077060162*this.age + 40846.7485475612;
			}		
			if(this.age > 3707612.093 && this.age <= 7639410.196){
				this.StrtL = 0.000000000000000000000000191371*Math.pow(this.age,4) - 0.000000000000000004591397715446*Math.pow(this.age,3) + 0.000000000040925312672693*Math.pow(this.age,2) - 0.000160785856100201*this.age + 316.638013451893;
			}		
			if(this.age > 7639410.196 && this.age <= 292543666.4){
				this.StrtL = -0.000000000000000000000000116786*Math.pow(this.age,3) + 0.000000000000000226088960599458*Math.pow(this.age,2) + 0.0000000826056149708628*this.age + 80.4600231095611;
			}		
			//Determine Temp
			if(this.age > 94040.7686 && this.age <= 2844773.672){
				this.StarT = 0.000000000000000000000258686205*Math.pow(this.age,4) - 0.000000000000000457547762386468*Math.pow(this.age,3) - 0.000000000251987040013312*Math.pow(this.age,2) + 0.00115259338564488*this.age + 4140.51049391189;
			}		
			if(this.age > 2844773.672 && this.age <= 3972346.645){
				this.StarT = 0.000000000000000000020323892254*Math.pow(this.age,4) - 0.000000000000284517377124725*Math.pow(this.age,3) + 0.000001485150788115*Math.pow(this.age,2) - 3.42390069370757*this.age + 2951862.87715323;
			}		
			if(this.age > 3972346.645 && this.age <= 292543666.4){
				this.StarT = -0.000000000000000000000100442765*Math.pow(this.age,3) + 0.0000000000000243211497447823*Math.pow(this.age,2) - 0.00000840832322110073*this.age + 12381.3705179498;
			}		
			//PostMain
			//Determine Lum
			if(this.age > 292328700 && this.age <= 346239700){
				this.StrtL = 0.000000000000000000000142775027*Math.pow(this.age,3) - 0.000000000000134665652161824*Math.pow(this.age,2) + 0.0000425307169154981*this.age - 4361.05128617414;
			}		
			if(this.age > 346239700 && this.age <= 352503100){
				this.StrtL = 0.000000000003314168983209350000*Math.pow(this.age,2) - 0.002310004007367010000000000000*this.age + 402653.352183461;
			}		
			if(this.age > 352503100 && this.age <= 352792200){
				this.StrtL = 0.00000000114747749474619*Math.pow(this.age,2) - 0.809289719736901*this.age + 142693559.957183;
			}		
			if(this.age > 352792200 && this.age <= 355018300){
				this.StrtL = -0.000000000000000001151412254706*Math.pow(this.age,3) + 0.00000000119353876821825*Math.pow(this.age,2) - 0.41220338159079*this.age + 47429457.0298482;
			}			
			if(this.age > 355018300 && this.age <= 430050800){
				this.StrtL = -0.000000000000000000002410262441*Math.pow(this.age,3) + 0.00000000000291380228930621*Math.pow(this.age,2) - 0.00117173041179187*this.age + 156876.76683022;
			}	
			if(this.age > 430050800 && this.age <= 440536100){
				this.StrtL = 0.000000000000000000000003901112*Math.pow(this.age,4) - 0.00000000000000677544910561609*Math.pow(this.age,3) + 0.00000441278835595184*Math.pow(this.age,2) - 1277.31974228404*this.age + 138647302244.178;
			}				
			//Determine T
			if(this.age > 292328700 && this.age <= 352503100){
				this.StarT = 0.000000000000000000000000003084*Math.pow(this.age,4) - 0.000000000000000003950222063*Math.pow(this.age,3) + 0.00000000189471218048904*Math.pow(this.age,2) - 0.403398402939071*this.age + 32177542.7432681;
			}		
			if(this.age > 352503100 && this.age <= 357309500){
				this.StarT = 0.000000000000000052118752346141*Math.pow(this.age,3) - 0.0000000551492421419057*Math.pow(this.age,2) + 19.4496866893048*this.age - 2286184839.44324;
			}		
			if(this.age > 357309500 && this.age <= 407701500){
				this.StarT = 0.000000000000000000022789409749*Math.pow(this.age,3) - 0.0000000000265629790938707*Math.pow(this.age,2) + 0.0103134731355903*this.age - 1329074.05795939;
			}		
			if(this.age > 407701500 && this.age <= 440536100){
				this.StarT = -0.000000000000000000159048455202*Math.pow(this.age,3) + 0.000000000200056073358194*Math.pow(this.age,2) - 0.0838641952088312*this.age + 11721426.7846571;
			}		
			if(this.age > 440536100){
				this.ageStar = false;
			}
		}	
		if(this.mass == 2){
			//Pre Main
			//Determine Lum
			if(this.age > 108987.1661 && this.age <= 2715122.633){
				this.StrtL = 0.000000000000000000000003156963*Math.pow(this.age,4) - 0.000000000000000023071025302184*Math.pow(this.age,3) + 0.0000000000617080518352841*Math.pow(this.age,2) - 0.000072691028743809*this.age + 36.7826371122;				
			}
			if(this.age > 2715122.633 && this.age <= 6983736){
				this.StrtL = -0.000000000000000000000000001337*Math.pow(this.age,4) + 0.000000000000000000192644109195*Math.pow(this.age,3) - 0.00000000000109773188393449*Math.pow(this.age,2) + 0.000001524721243981870000000000*this.age + 3.90671317690047
			}
			if(this.age > 6983736 && this.age <= 9394897.798){
				this.StrtL = -0.000000000000000000000004215632*Math.pow(this.age,4) + 0.000000000000000135750129542195*Math.pow(this.age,3) - 0.00000000162764706546419*Math.pow(this.age,2) + 0.00860853604301013*this.age - 16921.5644057989
			}
			if(this.age > 9394897.798 && this.age <= 21426098.64){
				this.StrtL = 0.000000000000000000000000001461*Math.pow(this.age,4) - 0.000000000000000000096511838171*Math.pow(this.age,3) + 0.00000000000236015230392202*Math.pow(this.age,2) - 0.0000253290276528448*Math.pow(this.age,1) + 117.12889220323;
			}
			if(this.age > 21426098.64 && this.age <= 91218030.27){
				this.StrtL = -0.000000000000000000000000854221*Math.pow(this.age,3) + 0.000000000000000171100545652985*Math.pow(this.age,2) - 0.00000000629759122828843*this.age + 16.4681073904505;
			}
			//Determine Temp
			if(this.age > 108987.1661 && this.age <= 6909925.738){
				this.StarT = 0.000000000000000000000004811212*Math.pow(this.age,4) - 0.000000000000000037038620129693*Math.pow(this.age,3) + 0.000000000065357302378606900000*Math.pow(this.age,2) + 0.000211700363848657*this.age + 4253.16428661049;
			}
			if(this.age > 6909925.738 && this.age <= 9025842.482){
				this.StarT = -0.000000000000000000000751230574*Math.pow(this.age,4) + 0.000000000000024539676805558*Math.pow(this.age,3) - 0.000000299415802536639*Math.pow(this.age,2) + 1.61749899288755*Math.pow(this.age,1) - 3256602.41934413;
			}
			if(this.age > 9025842.482 && this.age <= 11683040.17){
				this.StarT = -0.000000000000000000000043737999*Math.pow(this.age,4) + 0.00000000000000189027794982707*Math.pow(this.age,3) - 0.0000000305927101806574*Math.pow(this.age,2) + 0.21973387899808*this.age - 581806.840273493;
			}
			if(this.age > 11683040.17 && this.age <= 15693440.68){
				this.StarT = -0.000000000000000000000000012785*Math.pow(this.age,4) + 0.000000000000000000778214913197*Math.pow(this.age,3) - 0.00000000001823598139123*Math.pow(this.age,2) + 0.000194451307474785*this.age + 8356.80678037691;
			}
			if(this.age > 15693440.68 && this.age <= 91218030.27){
				this.StarT = -0.000000000000000000000000000004*Math.pow(this.age,4) + 0.000000000000000000001004416686*Math.pow(this.age,3) - 0.0000000000000785029488841619*Math.pow(this.age,2) + 0.000000980777552616517*this.age + 9150.53465076393;
			}
			//Post Main
			//Determine Lum
			if(this.age > 904947600 && this.age <= 1094077000){
				this.StrtL = 0.000000000000000000000000751302*Math.pow(this.age,3) - 0.00000000000000222118389685249*Math.pow(this.age,2) + 0.00000219010551087782*this.age - 696.334470921438;
			}
			if(this.age > 1094077000 && this.age <= 1115943000){
				this.StrtL = 0.000000000000056715615397416300*Math.pow(this.age,2) - 0.000125013035162153*this.age + 68910.0440986514;
			}
			if(this.age > 1115943000 && this.age <= 1116510000){
				this.StrtL = 0.0000000000266850078494433*Math.pow(this.age,2) - 0.0595723680116042*this.age + 33247791.0372644;
			}
			if(this.age > 1116510000 && this.age <= 1129124000){
				this.StrtL = 0.000000000000000000011977787943*Math.pow(this.age,3) - 0.0000000000404496440213163*Math.pow(this.age,2) + 0.0455315450872138*this.age - 17083194.1590496;
			}
			if(this.age > 1129124000 && this.age <= 1383546000){
				this.StrtL = 0.00000000000000000000000482762*Math.pow(this.age,3) - 0.0000000000000179293063935007*Math.pow(this.age,2) + 0.0000222134299723633*this.age - 9138.87388229432;
			}
			if(this.age > 1383546000 && this.age <= 1411247000){
				this.StrtL = 0.000000000000000000000000021128*Math.pow(this.age,4) - 0.000000000000000118017261898309*Math.pow(this.age,3) + 0.000000247205730677834*Math.pow(this.age,2) - 230.135327359394*this.age + 80340321241.6935;
			}
			//Determine Temp
			if(this.age > 904947600 && this.age <= 1115943000){
				this.StarT = 0.000000000000000000000000000014*Math.pow(this.age,4) - 0.000000000000000000055522334757*Math.pow(this.age,3) + 0.0000000000832452101198042*Math.pow(this.age,2) - 0.05538704135315*this.age + 13806289.948043;
			}
			if(this.age > 1115943000 && this.age <= 1148104000){
				this.StarT = -0.000000000000000000297694600595*Math.pow(this.age,3) + 0.00000000101371173202554*Math.pow(this.age,2) - 1.15064674670494*this.age + 435370144.356042;
			}
			if(this.age > 1148104000 && this.age <= 1340253000){
				this.StarT = 0.000000000000000000000013464746*Math.pow(this.age,3) - 0.0000000000000519342543677344*Math.pow(this.age,2) + 0.0000667382286300403*this.age - 23753.7623149295;
			}
			if(this.age > 1340253000 && this.age <= 1411247000){
				this.StarT = -0.000000000000000000003362407521*Math.pow(this.age,3) + 0.0000000000135645071858172*Math.pow(this.age,2) - 0.0182387888112066*this.age + 8178658.23922844;
			}
			if(this.age > 1411247000){
				this.ageStar = false;
			}
		}
		if(this.mass == 1){
			//Pre Main Sequence
			if(this.age > 124045 && this.age<= 22799570){
				this.StrtL = 19526.0989948542*Math.pow(this.age,-0.650992684796799);
				this.StarT = -0.000000000000000000000000011908*Math.pow(this.age,4) + 0.000000000000000000603445768001*Math.pow(this.age,3) - 0.00000000000834063312709914*Math.pow(this.age,2) + 0.0000477134954830759*this.age + 4056.80825170927;
			}
			//Post Main Sequence
			//Determine Lum
			if((this.age > 22799570 && this.age <= 11493180000)){
				this.StrtL = 0.631066256673886*Math.pow(Math.E,0.000000000099958872373336*this.age);
			}
			if((this.age > 11493180000 && this.age <= 11888610000)){
				this.StrtL = 0.000000000541870000696029*Math.pow(Math.E,0.0000000019027437925021*this.age);
			}
			if((this.age > 11888610000 && this.age <= 12214520000)){
				this.StrtL = 0.000000000000000695704885136582*Math.pow(this.age,2)-0.000016700187669936*this.age+100225.27572873;
			}
			if((this.age > 12214520000 && this.age <= 12259360000)){
				this.StrtL = 0.00000000000019093844502015*Math.pow(this.age,2)-0.00466995229764663*this.age+28554346.6197381;
			}
			if((this.age > 12259360000 && this.age <= 12269810000)){
				this.StrtL = 0.000000000015300243562067*Math.pow(this.age,2)-0.375227022621072*this.age+2300540790.64792;
			}
			//Determine T
			if((this.age > 22799570 && this.age <= 9420374000)){
				this.StarT = -0.000000000000000003724729927913*Math.pow(this.age,2)+0.0000000552368253131796*this.age+5633.54373565226;
			}
			if((this.age > 9420374000 && this.age <= 11729670000)){
				this.StarT = -0.000000000000000447268257312746*Math.pow(this.age,2)+0.0000092075730384883*this.age - 41513.7485848932;
			}
			if((this.age > 11729670000 && this.age <= 12223100000)){
				this.StarT = -0.000000000000004248946298846490*Math.pow(this.age,2)+0.000100898220989689000000000000*this.age - 594126.399867907;
			}
			if((this.age > 12223100000 && this.age <= 12269810000)){
				this.StarT = -0.000000000000727587113623613*Math.pow(this.age,2)+0.0178043924509932*this.age-108916196.026289;
			}
			if(this.age > 12269810000){
				this.ageStar = false;
			}
		}
		this.starX = Math.floor(845.73*Math.pow((Math.E),(-0.00007*this.StarT))) - this.offsetX;
		this.starY = Math.floor(-19.54*Math.log(this.StrtL)+315) - this.offsetY;

		renderer.moveCircle(this.ID, this.starX, this.starY);
	}
	
	starObj.prototype.hideStar = function(){
		renderer.colorCircle(this.ID, 'black');
	}