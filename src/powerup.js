"use strict";

module.exports = exports = Powerup;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Powerup(position, idx, method, player) {
  this.method = method;
  this.player = player;
  this.x = position.x;
  this.y = position.y;
  this.width = 12;
  this.height = 12;
  this.img = new Image();
  this.img.src = 'assets/bullets.png';
  this.tmap = new Tilemap(this.img, 12, 12);
  this.timer = 0;
  this.idx = idx;
}

Powerup.prototype.update = function(elapasedTime, ctx) {
  this.y += 0.05 * elapasedTime;
  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  if(px > this.x - 10 && py > this.y - 10 && px < this.x + this.width + 10 && py < this.y + this.height + 10) {
    this.player.fire = this.method;
    return true;
  }
}

Powerup.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  this.tmap.render(this.idx, ctx);
  ctx.restore();
}
