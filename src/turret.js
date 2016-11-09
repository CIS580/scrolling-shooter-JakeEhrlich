"use strict";

module.exports = exports = Turret;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Turret(position, bullets) {
  this.bullets = bullets;
  this.x = position.x;
  this.y = position.y;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/ships.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = 0;
  this.idx = 0;
  this.firerate = 4 / 1000;
  this.toshoot = 0;
  this.health = 9;
}

Turret.prototype.update = function(elapasedTime, ctx) {
  this.timer += elapasedTime;
  this.toshoot += this.firerate * elapasedTime;
  while(this.toshoot > 1) {
    //console.log("fire!");
    var theta = this.timer*0.001;
    var vx = 4*Math.cos(theta);
    var vy = 4*Math.sin(theta);
    this.bullets.add({x:this.x, y:this.y}, {x:vx, y:vy});
    this.toshoot -= 1;
  }
  return this.health < 0;
}

Turret.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(20, ctx);
  ctx.restore();
}
