"use strict";

module.exports = exports = Tilemap;

//a class to draw a part of an image
function Tilemap(img, tx, ty) {
  this.img = img;
  this.tx = tx;
  this.ty = ty;
  this.tw = Math.floor(this.img.width / this.tx);
}

Tilemap.prototype.render = function(idx, ctx) {
  if(!this.tw) this.tw = Math.floor(this.img.width / this.tx);
  var y = Math.floor(idx / this.tw) * this.ty;
  var x = (idx % this.tw) * this.tx;
  ctx.drawImage(this.img, x, y, this.tx, this.ty, 0, 0, this.tx, this.ty);
}
