"use strict";

module.exports = exports = Cloud;

//a class to draw a part of an image
function Cloud(position, tile) {
  this.position = {x:position.x, y:position.y};
  this.img = tile;
}

Cloud.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  this.img.render(elapsedTime, ctx);
  ctx.restore();
}
