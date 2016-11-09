"use strict";

module.exports = exports = Sine;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Sine(position, bullets) {
  this.health = 30;
  this.x = position.x;
  this.basex = this.x;
  this.y = position.y;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/ships.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = Math.random() * Math.PI * 400;
  this.idx = 0;
  this.freq = 0.005;
  this.firerate = (3 * Math.random() + 2) / 1000;
  this.toshoot = 0;
  this.amp = 20;
  this.bullets = bullets;
}

Sine.prototype.update = function(elapasedTime, ctx) {
  this.toshoot += this.firerate * elapasedTime;
  while(this.toshoot > 1) {
    //console.log("fire!");
    this.bullets.add({x:this.x, y:this.y}, {x:0, y:4});
    this.toshoot -= 1;
  }
  this.timer += elapasedTime;
  this.x = this.basex + this.amp * Math.sin(this.freq * this.timer);
  this.y += 0.05 * elapasedTime;
  return this.health <= 0;
}

Sine.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(3, ctx);
  ctx.restore();
}
