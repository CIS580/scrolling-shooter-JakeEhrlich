"use strict";

module.exports = exports = Wheel;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Wheel(position) {
  this.x = position.x;
  this.y = position.y;
  this.img = new Image();
  this.img.src = 'assets/spinny.png';
  this.tmap = new Tilemap(this.img, 48, 48);
  this.timer = 0;
  this.idx = 0;
}

Wheel.prototype.update = function(elapasedTime, ctx) {
  this.timer += elapasedTime;
  if(this.timer > 25) {
    this.idx++;
    this.timer = 0;
  }
  if(this.idx == 4) this.idx = 0;
}

Wheel.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(this.idx, ctx);
  ctx.restore();
}
