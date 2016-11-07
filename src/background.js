"use strict";

module.exports = exports = Background;

/* Classes and Libraries */
const Tilemap = require('./tilemap');

//this is my most costly item so I try and optimize it as much as possible
function Background(camera) {
  this.img = new Image();
  this.img.src = 'assets/shapesy.png';
  this.tx = 24;
  this.ty = 28;
  this.tmap = new Tilemap(this.img, this.tx, this.ty);
  this.buffer = document.createElement('canvas');
  this.buffer.width = 1028 + 48;
  this.buffer.height = 768 + 28*2;
  this.ctx = this.buffer.getContext('2d');
  this.camera = camera;
  this.loaded = false
}

Background.prototype.render = function(elapasedTime, ctx) {
  if(!this.loaded && this.tmap.img.complete) {
    console.log("loaded!");
    for(var i = 0; i * this.tx <= this.camera.width + 48; ++i) {
      for(var j = 0; j * this.ty <= this.camera.height + 28*2; ++j) {
        this.tmap.render(24, this.ctx, i*this.tx, j*this.ty);
      }
    }
    this.loaded = true;
  }
  var cy = Math.floor(this.camera.y / this.ty) * this.ty;
  ctx.drawImage(this.buffer, 0, cy);
  //loop over the bounds
  /*
  for(var i = -1; i * this.tx <= this.camera.width; ++i) {
    for(var j = -1; j * this.ty <= this.camera.height; ++j) {
      //ctx.save();
      var cy = Math.floor(this.camera.y / this.ty) * this.ty;
      //ctx.translate(i*this.tx, j*this.ty + cy); //count act camera
      this.tmap.render(24, ctx, i*this.tx, j*this.ty + cy); //draw plane water
      //ctx.restore();
    }
  }*/
}
