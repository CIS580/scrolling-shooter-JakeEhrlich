"use strict";

module.exports = exports = Wheel;
const Tilemap = require('./tilemap');

function explode(smoke, x, y) {
  for(var i = 0; i < 50; ++i) {
    var theta = Math.random() * 2 * Math.PI;
    var mag = Math.random() * 0.5;
    var vx = mag * Math.cos(theta);
    var vy = mag * Math.sin(theta);
    smoke.emit({x:x, y:y}, {x:vx, y:vy});
  }
}

//a class to draw a part of an image
function Wheel(position, player, smoke) {
  this.player = player;
  this.health = 100;
  this.smoke = smoke;
  this.x = position.x;
  this.y = position.y;
  this.width = 48;
  this.height = 48;
  this.img = new Image();
  this.img.src = 'assets/spinny.png';
  this.tmap = new Tilemap(this.img, 48, 48);
  this.timer = 0;
  this.idx = 0;
}

Wheel.prototype.update = function(elapasedTime, ctx) {
  this.y += 0.05 * elapasedTime;
  this.timer += elapasedTime;
  if(this.timer > 25) {
    this.idx++;
    this.timer = 0;
  }
  if(this.idx == 4) this.idx = 0;
  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  if(px > this.x && py > this.y && px < this.x + this.width && py < this.y + this.height) {
    explode(this.smoke, this.x, this.y);
    this.player.health -= 50;
    return true;
  }
  return this.health < 0;
}

Wheel.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(this.idx, ctx);
  ctx.restore();
}
