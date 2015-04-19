window.addEventListener("load",function() {


	

var Q = Quintus().include("Sprites,TMX, Scenes, Input, 2D, Anim, Touch, UI")
	.setup({width: 320,
			height: 480})
	.controls().touch();

Q.animations("marioAnim", {

	run_right: {frames:[1,2,3],rate: 1/10},
	run_left: {frames: [15,16,17],rate: 1/10},
	stand_right: {frames:[0],rate:1/15},
	stand_left: {frames:[14],rate:1/15},
	jump_right:{ frames: [4], rate: 1/50, loop: false},
	jump_left:{ frames: [18], rate: 1/50, loop: false}


});

Q.animations("bloopaAnim", { 

		move: {frames: [0,1], rate: 1/2},
		die: {frames: [2], rate: 1/2, loop:false, trigger: "deathEvent"}
});

Q.animations("goombaAnim",{ 
	move: {frames: [0,1], rate: 1/5},
	die: {frames: [2], rate: 1/5, loop:false, trigger: "deathEvent"}
});

Q.Sprite.extend("Mario",{

	init: function(p) {


	this._super(p, {
		sheet: "marioR",
		sprite:"marioAnim",
		x: 50,
		y: 500,
		jumpSpeed:-600

	});

	this.add("2d,platformerControls,animation");
	},

	step: function(dt){

		if(this.p.y>600){

			 Q.stageScene("endGame",1, { label: "You died" });
			 this.destroy();
		}
		
		if(this.p.vx==0)
			this.play("stand_"+this.p.direction);		
		else
			this.play("run_"+this.p.direction);

		if(this.p.vy!=0)
			this.play("jump_"+this.p.direction);

	}

});

Q.Sprite.extend("Goomba",{

	init:function(p){
		this._super(p,{
			sheet:"goomba",
			sprite:"goombaAnim",
			x:300,
			y:500,
			vx:-80

		});
	this.add("2d,aiBounce,animation,defaultEnemy");


	}


});


Q.Sprite.extend("Bloopa",{

	init:function(p){
		this._super(p,{
			sheet:"bloopa",
			sprite:"bloopaAnim",
			x:170,
			gravity:0.2,
			y:400,
			initY:400,
			downardRange:100,
			upwardSpeed:202

			

		});
	this.add("2d,animation,defaultEnemy");



	},
	step: function(dt){

		if(this.p.y>=this.p.initY+this.p.downardRange){
			this.p.vy= -this.p.upwardSpeed;
		}
		
	}
});

Q.component("defaultEnemy",{

	added: function(){

		this.entity.play("move");

	this.entity.on("bump.bottom,bump.left,bump.right",function(collision){
		if(collision.obj.isA("Mario"))
		{
				Q.stageScene("endGame",1, { label: "You died" });
				collision.obj.destroy();
		}
	 });

	this.entity.on("bump.top",function(collision){
		if(collision.obj.isA("Mario")){
			this.play("die");
			collision.obj.p.vy = -300;
		}
	});

	this.entity.on("deathEvent",this,function(){this.entity.destroy()});
	},

})

Q.Sprite.extend("Princess",{
	init:function(p){
		this._super(p,{
			sheet:"princess",
			x:1000,
			y:400
			
			
		});
		this.add("2d");
		this.on("hit.sprite",function(collision){

			if(collision.obj.isA("Mario")){
				Q.stageScene("endGame",1,{label:"You Won!"});
				collision.obj.destroy();
			}
		})
	}
		
});


Q.loadTMX("mainTitle.png,princess.png, bloopa.png, bloopa.json, goomba.png,goomba.json, mario_small.json, mario_small.png, level.tmx",function(){
		

	Q.sheet("princess","princess.png",{
			tilew:30,
			tileh:50,
			sx: 0,
			sy:0
		});

		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");

		Q.stageScene("mainTitleScene");

});		

Q.scene("level1",function(stage)
{


	Q.stageTMX("level.tmx",stage)
		
	var player = stage.insert(new Q.Mario());
	var goomba = stage.insert(new Q.Goomba());
	var bloopa = stage.insert(new Q.Bloopa());
	var princess = stage.insert(new Q.Princess());


	stage.add("viewport").follow(player);
	stage.viewport.offsetX = -60;
	stage.viewport.offsetY =  155;



	

});

Q.scene('mainTitleScene',function(stage) {


  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2
  }));
  
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           asset: "mainTitle.png" }))


		Q.input.on("confirm",this,function(){
			Q.clearStages();
			Q.stageScene("level1");

			
		});
		
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene("level1");
			
		});


});


Q.scene('endGame',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Go to menu" }))         
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('mainTitleScene');
  });
  Q.input.on("confirm",this,function(){
			Q.clearStages();
			Q.stageScene("mainTitleScene");

			
		});
  box.fit(20);
});







});


