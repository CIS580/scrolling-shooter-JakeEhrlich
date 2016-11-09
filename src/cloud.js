"use strict";

module.exports = exports = Cloud;
const Tile = require('./tile');

//a class to draw a part of an image
function Cloud(position, camera) {
  this.camera = camera;
  this.x = position.x;
  this.y = position.y;
  var tile = {x:80, y:305, width:170-80, height:460-305, scaleX:170-80, scaleY:460-305};
  this.width = tile.width;
  this.height = tile.height;
  this.img = new Image();
  this.img.src = 'assets/shapesy.png';
  this.tile = new Tile(tile, this.img);
}

Cloud.prototype.update = function(elapasedTime, ctx) {
  this.y += 0.1 * elapasedTime;
  if(this.y > this.camera.y + this.camera.height) {
    this.x = Math.random() * 1000;
    this.y = this.camera.y - 120 - Math.random() * (800 - 120);
  }
}

Cloud.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  this.tile.render(elapasedTime, ctx);
  ctx.restore();
}
