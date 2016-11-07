"use strict";

module.exports = exports = Tile;

//a class to draw a part of an image
function Tile(tile, img, colorkey) {
  this.img = img;
  this.width = tile.width;
  this.tile = tile;
  this.height = tile.height;
  this.buffer = document.createElement('canvas');
  this.buffer.width = tile.width;
  this.buffer.height = tile.height;
  this.ctx = this.buffer.getContext('2d');
  this.drawn = false;
}

Tile.prototype.render = function(elapasedTime, ctx) {
  if(this.img.complete && !this.drawn) {
    var tile = this.tile;
    this.ctx.drawImage(this.img, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.scaleX, tile.scaleY);
  }
  //ctx.drawImage(this.img, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.scaleX, tile.scaleY);
  ctx.drawImage(this.buffer, 0, 0);
}
