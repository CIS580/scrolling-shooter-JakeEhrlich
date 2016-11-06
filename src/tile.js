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
  //this.ctx.drawImage(this.img, 48+offset, 57, 23, 27, 0, 0, 23, 27);

  //the used sprites use color keys not alpha so I have to do this
  var self = this;
  this.onload = function() {
    if(colorkey) {
      console.log("colorkeying!");
      var imgdata = self.ctx.getImageData(0, 0, self.width, self.height);
      var data = imgdata.data;
      for(var i = 0; i < data.length; ++i) {
        if(data[0] === colorkey[0] && data[1] === colorkey[1] && data[2] === colorkey[2]) {
          data[4] = 0;
        }
      }
      self.ctx.putImageData(imgdata, 0, 0);
    }
  }
}

Tile.prototype.render = function(elapasedTime, ctx) {
  if(this.img.complete && !this.drawn) {
    var tile = this.tile;
    this.ctx.drawImage(this.img, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.scaleX, tile.scaleY);
    this.onload();
  }
  //console.log("got here!");
  var tile = this.tile;
  //ctx.drawImage(this.img, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.scaleX, tile.scaleY);
  ctx.drawImage(this.buffer, 0, 0);
}
