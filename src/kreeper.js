"use strict";

module.exports = exports = Kreeper;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Kreeper(position, player, smoke) {
  this.x = position.x;
  this.y = position.y;
  this.player = player;
  this.smoke = smoke;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/stuff.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = 0;
  this.state = "waiting";
  this.health = 10;
}

function explode(smoke, x, y) {
  for(var i = 0; i < 50; ++i) {
    var theta = Math.random() * 2 * Math.PI;
    var mag = Math.random() * 0.5;
    var vx = mag * Math.cos(theta);
    var vy = mag * Math.sin(theta);
    smoke.emit({x:x, y:y}, {x:vx, y:vy});
  }
}

Kreeper.prototype.update = function(elapasedTime, ctx) {

  this.y += 0.05 * elapasedTime;
  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  switch(this.state) {
  case "waiting":
    var py = this.player.position.y + this.player.offy;
    var px = this.player.position.x + this.player.offx;
    if(px > this.x - 40 && py > this.y - 40 && px < this.x + this.width + 30 && py < this.y + this.height + 30) {
      this.state = "toexplode"
    }
    if(this.health < 0) explode(this.smoke, this.x, this.y);
    return this.health < 0;;
  case "toexplode":
    this.timer += elapasedTime;
    if(this.timer > 500) {
      this.timer = 0;
      explode(this.smoke, this.x, this.y);
      if(px > this.x - 10 && py > this.y - 10 && px < this.x + this.width + 5 && py < this.y + this.height + 5) {
        this.player.health -= 10;
      }
      return true;
    }
  }
}

Kreeper.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(0, ctx);
  ctx.restore();
}
