"use strict";

module.exports = exports = Level0;

const SmokeParticles = require('./smoke_particles')
const Wheel = require('./wheel');
const Kamakazi = require('./kamakazi');
const Sine = require('./sine');
const Turret = require('./turret');
const Kreeper = require('./kreeper');
const Powerup = require('./powerup');
const Level1 = require('./level1');


//a class to draw a part of an image
function Level0(bads, player, smoke, badbullets) {
  this.num = 0;
  this.bads = bads;
  this.player = player;
  this.smoke = smoke;
  this.badbullets = badbullets;
  for(var i = 0; i < 19; ++i) {
    bads.push(new Wheel({x:1000*i/20, y:-700}, player, smoke));
  }
  for(var i = 0; i < 10; ++i) {
    var y = -Math.random() * 200 - 1000;
    bads.push(new Kamakazi({x:1000*i/20, y:y}, player, smoke));
  }
  for(var i = 0; i < 19; ++i) {
    var y = -Math.random() * 200 - 1200;
    bads.push(new Kreeper({x:1000*i/20, y:y}, player, smoke));
  }
  for(var i = 0; i < 5; ++i) {
    var y = -1500;
    bads.push(new Sine({x:1000*i/5, y:y}, badbullets));
  }
  for(var i = 0; i < 5; ++i) {
    var y = -1800;
    bads.push(new Turret({x:1000*i/5, y:y}, badbullets));
  }
}

function rebuild(bads, player) {
  function tri() {
    player.fireTriBullet();
  }
  function quad() {
    player.fireQuadBullet();
  }
  function mega() {
    player.fireMegaBullet();
  }
  for(var i = 0; i < 10; ++i) {
    var pos = {x:Math.random() * 1000, y : -Math.random() * 10000};
    bads.push(new Powerup(pos, 1, tri, player));
  }
  for(var i = 0; i < 20; ++i) {
    var pos = {x:Math.random() * 1000, y : -Math.random() * 10000};
    bads.push(new Powerup(pos, 0, quad, player));
  }
  for(var i = 0; i < 2; ++i) {
    var pos = {x:Math.random() * 1000, y : -Math.random() * 10000};
    bads.push(new Powerup(pos, 2, mega, player));
  }
}

Level0.prototype.update = function(bads) {
  var py = this.player.position.y + this.player.offy;
  if(py < -2500) {
    console.log("next level!");
    while(bads.length > 0) bads.pop();
    rebuild(bads, this.player);
    this.player.health = 100;
    this.player.position.y = 0;
    return new Level1(bads, this.player, this.smoke, this.badbullets);
  }
  return this;
}
