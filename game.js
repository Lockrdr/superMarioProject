	/*
	Ricardo de la Rosa Vivas
	02310276H
	23/04/2015
	*/

	window.addEventListener("load",function() {


		

	var Q = window.Q = Quintus({audioSupported: ["ogg"]}).include("Sprites,TMX, Scenes, Input, 2D, Anim, Touch, UI,Audio")
		.setup({width: 320,
				height: 480})
		.controls().touch().enableSound();

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

	Q.animations("koopaAnim",{ 
		moveRight: {frames: [0,1], rate: 1/5},
		flyR: {frames: [2,3], rate: 1/5},
		moveLeft: {frames: [4,5], rate: 1/5},
		flyL: {frames: [6,7], rate: 1/5},
		shell: {frames:[8],rate:1/15},
		die: {frames: [10], rate: 1/5, loop:false, trigger: "deathEvent"}
		
	});

	Q.Sprite.extend("Mario",{

		init: function(p) {


		this._super(p, {
			sheet: "marioR",
			sprite:"marioAnim",
			x: 50,
			y: 500,
			jumpSpeed:-400

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

	Q.Sprite.extend("Koopa",{

		init:function(p){
			this._super(p,{
				sheet:"KoopaTroopaR",
				sprite:"koopaAnim",
				x:350,
				y:400,
				initY:400,
				gravity:0.2,
				direction:"right",
				flying: true,
				outOfShell: true,
				movingShell:false,
				downardRange:100,
				upwardSpeed:202


			});

		this.add("2d,animation,aiBounce");
		this.play("flyR");
		this.on("deathEvent",this,function(){this.destroy()});


		this.on("bump.bottom",function(collision){

			if(collision.obj.isA("Mario")){
				Q.stageScene("endGame",1, { label: "You died" });
				collision.obj.destroy();
				Q.audio.stop();
				Q.audio.play("music_die.ogg");
			}
		})

		this.on("bump.left,bump.right",function(collision){
			if(!this.p.flying&&this.p.outOfShell)
				if (this.p.direction=="right"){
					this.play("moveLeft")
					this.p.direction="left";
				}
				else{
				
					this.play("moveRight");
					this.p.direction="right";
				}
			if(collision.obj.isA("Mario"))
			{
				if(this.p.outOfShell||this.p.movingShell){
					Q.stageScene("endGame",1, { label: "You died" });
					collision.obj.destroy();
					Q.audio.stop();
					Q.audio.play("music_die.ogg");
				}
				else
				{
					
					if(collision.obj.p.direction=="right"){
						this.p.x+=10;
						this.p.vx=200;
					 }else{
						this.p.x-=10;
						this.p.vx=-200;

					}
					this.p.movingShell=true;
				}
			}
			
		 });

		this.on("bump.top",function(collision){
			if(collision.obj.isA("Mario")){
				
				collision.obj.p.vy = -300;
				if(this.p.flying){
					this.p.gravity=1;
					this.p.flying=false;
					this.play("moveRight");
					this.p.vx=50;

					this.step=null;

					
				}else if(this.p.outOfShell)
				{
					//get inside shell
					
					this.play("shell");
					this.p.outOfShell=false;
					this.p.movingShell=false;
					this.p.vx=0;
					
				}
				else if(this.p.movingShell){
					this.p.vx=0;
					this.p.movingShell=false;
				}
				else{
					this.play("die");
				}
			}
		});


		},
		step: function(dt){

			if(this.p.y>=this.p.initY+this.p.downardRange){
				this.p.vy= -this.p.upwardSpeed;
			}
			
		}

	});



	Q.Sprite.extend("Goomba",{

		init:function(p){
			this._super(p,{
				sheet:"goomba",
				sprite:"goombaAnim",
				x:100,
				y:500,
				vx:80

			});
		this.add("2d,aiBounce,animation,defaultEnemy");


		}


	});


	Q.Sprite.extend("Bloopa",{

		init:function(p){
			this._super(p,{
				sheet:"bloopa",
				sprite:"bloopaAnim",
				x:500,
				gravity:0.1,
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
					Q.audio.stop();
					Q.audio.play("music_die.ogg");
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
					Q.audio.stop();
					Q.audio.play("music_level_complete.ogg");
					collision.obj.destroy();
				}
			})
		}
			
	});



	Q.loadTMX("music_main.ogg, music_level_complete.ogg, music_die.ogg,coin.ogg,koopa.png,koopa.json,coin.png, coin.json,mainTitle.png,princess.png, bloopa.png, bloopa.json, goomba.png,goomba.json, mario_small.json, mario_small.png, level.tmx",function(){
			

		Q.sheet("princess","princess.png",{
				tilew:30,
				tileh:50,
				sx: 0,
				sy:0
			});

			Q.compileSheets("mario_small.png","mario_small.json");
			Q.compileSheets("goomba.png","goomba.json");
			Q.compileSheets("bloopa.png","bloopa.json");
			Q.compileSheets("coin.png","coin.json");
			Q.compileSheets("koopa.png","koopa.json");

			Q.stageScene("mainTitleScene");

	});		

	Q.UI.Text.extend("Score",{


		init:function(p){
			this._super({
				label:"Score 0",
				x:75,
				y:0
			});

			Q.state.on("change.score",this,"score");
		},
		score: function(score){
			this.p.label="Score "+score;
		}
	});

	Q.scene("HUD",function(stage){

		var container = stage.insert(new Q.UI.Container({
			x:0,y:0
		}));
		var label= container.insert(new Q.Score());

		Q.state.set("score",0);
	})

	Q.scene("level1",function(stage)
	{


		Q.stageTMX("level.tmx",stage)
		
		Q.audio.stop();
		Q.audio.play("music_main.ogg",{loop:true});

		var player = stage.insert(new Q.Mario());
		var goomba = stage.insert(new Q.Goomba());
		var bloopa = stage.insert(new Q.Bloopa());
		var koopa = stage.insert(new Q.Koopa());
		var princess = stage.insert(new Q.Princess());
		

		stage.insert(new Q.Coin({x:630,y:420}));
		stage.insert(new Q.Coin({x:660,y:420}));
		stage.insert(new Q.Coin({x:690,y:420}));
		stage.insert(new Q.Coin({x:720,y:420}));
		stage.insert(new Q.Coin({x:750,y:420}));
		stage.insert(new Q.Coin({x:780,y:420}));

		stage.insert(new Q.Coin({x:630,y:460}));
		stage.insert(new Q.Coin({x:660,y:460}));
		stage.insert(new Q.Coin({x:690,y:460}));
		stage.insert(new Q.Coin({x:720,y:460}));
		stage.insert(new Q.Coin({x:750,y:460}));
		stage.insert(new Q.Coin({x:780,y:460}));


		stage.add("viewport").follow(player);
		stage.viewport.offsetX = -60;
		stage.viewport.offsetY =  155;



		

	});

	Q.scene('mainTitleScene',function(stage) {

		Q.audio.stop();
	  var box = stage.insert(new Q.UI.Container({
	    x: Q.width/2, y: Q.height/2
	  }));
	  
	  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                           asset: "mainTitle.png" }))


			Q.input.on("confirm",this,function(){
				Q.clearStages();
				Q.stageScene("level1");
				Q.stageScene("HUD",1);

				
			});
			
			button.on("click",function() {
				Q.clearStages();
				Q.stageScene("level1");
				Q.stageScene("HUD",1);
				
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




	Q.Sprite.extend("Coin",{

		init: function(p){
			this._super(p,{
				sheet:"coin",
				x: 300,
				y: 400,
				angle:0,
				touched:false,
				sensor:true


			});
			this.add("tween");

			this.on("hit", function(collision){

				if(collision.obj.isA("Mario")&&(!this.p.touched)){
					Q.audio.play("coin.ogg");

					//this avoid giving more than 1 point for each coin,
					// becuase the until the anim is not over is not eliminated
					this.p.touched=true;
					
					this.animate({y: this.p.y - 50},0.2,Q.Easing.Linear,{callback: function(){this.destroy()}});
					Q.state.inc("score",1);
				}
			})
		}
	});
});


