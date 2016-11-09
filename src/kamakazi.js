"use strict";

module.exports = exports = Kamakazi;
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
function Kamakazi(position, player, smoke) {
  this.health = 50;
  this.smoke = smoke;
  this.x = position.x;
  this.y = position.y;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/ships.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = 0;
  this.idx = 0;
  this.player = player;
}

Kamakazi.prototype.update = function(elapasedTime, ctx) {
  //console.log(this.player);
  var px = this.player.position.x + this.player.offx;
  var py = this.player.position.y + this.player.offy;
//  console.log(px, py);
  if(this.player.position.y - this.y < 500) {
    this.x += 0.1 * elapasedTime * Math.sign(px - this.x);
    this.y += 0.2 * elapasedTime;
  }

  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  if(px > this.x && py > this.y && px < this.x + this.width && py < this.y + this.height) {
    explode(this.smoke, this.x, this.y);
    this.player.health -= 20;
    return true;
  }
  return this.health <= 0;
}

Kamakazi.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(47, ctx);
  ctx.restore();
}
