"use strict";

module.exports = exports = Level2;

const SmokeParticles = require('./smoke_particles')
const Wheel = require('./wheel');
const Kamakazi = require('./kamakazi');
const Sine = require('./sine');
const Turret = require('./turret');
const Kreeper = require('./kreeper');
const Powerup = require('./powerup');

//a class to draw a part of an image
function Level2(bads, player, smoke, badbullets) {
  this.bads = bads;
  this.player = player;
  this.smoke = smoke;
  this.badbullets = badbullets;
  for(var i = 0; i < 19; ++i) {
    bads.push(new Wheel({x:1000*i/20, y:-700}, player, smoke));
  }
  for(var i = 0; i < 19; ++i) {
    bads.push(new Wheel({x:1000*i/20, y:-780}, player, smoke));
  }
  for(var i = 0; i < 19; ++i) {
    bads.push(new Wheel({x:1000*i/20, y:-860}, player, smoke));
  }
  for(var i = 0; i < 100; ++i) {
    var y = -Math.random() * 1000 - 1200;
    var x = Math.random() * 1000;
    bads.push(new Kamakazi({x:x, y:y}, player, smoke));
  }
  for(var i = 0; i < 30; ++i) {
    bads.push(new Turret({x:1000*i/30, y:-2600}, badbullets));
  }
  for(var i = 0; i < 6; ++i) {
    bads.push(new Sine({x:1000*i/6, y:-3000}, badbullets));
  }
  for(var i = 0; i < 19; i+=2) {
    bads.push(new Kreeper({x:1000*i/20, y:-2640}, player, smoke));
  }
  for(var i = 1; i < 19; i+=2) {
    bads.push(new Kreeper({x:1000*i/20, y:-2680}, player, smoke));
  }
  for(var i = 0; i < 19; i+=2) {
    bads.push(new Kreeper({x:1000*i/20, y:-2760}, player, smoke));
  }
  console.log("size: ", bads.length);
}

Level2.prototype.update = function(elapasedTime) {
  var py = this.player.position.y + this.player.offy;
  if(py < -3200) {
    console.log("nextity lebvel yall");
    return this;
  }
  return this;
}
