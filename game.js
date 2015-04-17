window.addEventListener("load",function() {


	

var Q = Quintus().include("Sprites,TMX, Scenes, Input, 2D, Anim, Touch, UI")
	.setup({width: 320,
			height: 480})
	.controls().touch();



Q.Sprite.extend("Mario",{

	init: function(p) {


	this._super(p, {
		sheet: "marioR",
		x: 30,
		y: 500

	});

	this.add("2d,platformerControls");
	},

	step: function(dt){

		if(this.p.y>600){
			this.p.x=150;
			this.p.y=380;
			this.p.vy=0;
		}

	}

});

Q.Sprite.extend("Goomba",{

	init:function(p){
		this._super(p,{
			sheet:"goomba",
			x:300,
			y:500,
			vx:-80

		});
	this.add("2d,aiBounce");

	this.on("bump.left,bump.right",function(collision){

		if(collision.obj.isA("Mario"))
		{
			collision.obj.destroy();
		}
	});

	this.on("bump.top",function(collision){
		if(collision.obj.isA("Mario")){
			this.destroy();
			collision.obj.p.vy = -300;
		}
	});

	}


});


Q.Sprite.extend("Bloopa",{

	init:function(p){
		this._super(p,{
			sheet:"bloopa",
			x:170,
			gravity:0.2,
			y:400,
			initY:400,
			downardRange:100,
			upwardSpeed:178

			

		});
	this.add("2d");
	this.on("bump.bottom,bump.left,bump.right",function(collision){

		if(collision.obj.isA("Mario"))
		{
			collision.obj.destroy();
		}
	});

	this.on("bump.top",function(collision){
		if(collision.obj.isA("Mario")){
			this.destroy();
			collision.obj.p.vy = -300;
		}
	});

	},
	step: function(dt){

		if(this.p.y>=this.p.initY+this.p.downardRange){
			this.p.vy= -this.p.upwardSpeed;
		}
	}
})




Q.scene("level1",function(stage)
{
	Q.loadTMX("bloopa.png, bloopa.json, goomba.png,goomba.json, mario_small.json, mario_small.png, level.tmx",function(){
		Q.stageTMX("level.tmx",stage)

		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");

		var player = stage.insert(new Q.Mario());
		var goomba = stage.insert(new Q.Goomba());
		var bloopa = stage.insert(new Q.Bloopa());


	stage.add("viewport").follow(player);
	stage.viewport.offsetX = -60;
	stage.viewport.offsetY =  155;



	});	



	

	

	

});

Q.stageScene("level1");

















});


