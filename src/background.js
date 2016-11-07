"use strict";

module.exports = exports = Background;

/* Classes and Libraries */
const Tilemap = require('./tilemap');

//a class to efficently draw a background
//this is tricky because we want the background to move
//it only has to move a little however
//more over we want the background to draw *very* efficently because its
//the biggest thing we have to draw and just look how much the measly clouds
//slowed us down!
function Background(camera) {
  this.img = new Image();
  this.img.src = 'assets/shapesy.png';
  this.tx = 24;
  this.ty = 28;
  this.tmap = new Tilemap(this.img, this.tx, this.ty);
  this.camera = camera;
}

Background.prototype.render = function(elapasedTime, ctx) {
  //loop over the bounds
  for(var i = -1; i * this.tx <= this.camera.width; ++i) {
    for(var j = -1; j * this.ty <= this.camera.height; ++j) {
      ctx.save();
      var cy = Math.floor(this.camera.y / this.ty) * this.ty;
      ctx.translate(i*this.tx, j*this.ty + cy); //count act camera
      this.tmap.render(24, ctx); //draw plane water
      ctx.restore();
    }
  }
}
