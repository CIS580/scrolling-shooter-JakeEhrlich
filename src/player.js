"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Tile = require('./tile');
//const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, fire) {
  this.health = 100;
  this.offx = 300;
  this.offy = 500;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 0, y: 0};
  this.velocity = {x: 0, y: 0};
  this.img = new Image();
  this.img.src = 'assets/tyrian.shp.007.png';
  //color key is oddly #BFDCBF
  this.tile = new Tile({x:48,y:57,width:23,height:23,scaleX:23,scaleY:27}, this.img);
  var self = this;
  this.fire = function() { self.fireBullet(); };
  this.state = "live";
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {
  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = 0;
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.offx += this.velocity.x;
  this.offy += this.velocity.y;

  // don't let the player move off-screen
  if(this.offx < 0) this.offx = 0;
  if(this.offx > 1024 - 24) this.offx = 1024 - 24;
  if(this.offy < 0) this.offy = 0;
  if(this.offy > 786 - 24) this.offy = 786 - 24;

  return this.health > 0;
}

function drawStroked(ctx, text, x, y) {
    ctx.font = "48px impact"
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.strokeText(text, x, y);
    ctx.font = "48px impact"
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  if(this.health <= 0) {
    ctx.save();
    ctx.resetTransform();
    drawStroked(ctx, "YOU DIED", 410, 420);
    ctx.restore();
    return;
  }
  var offset = this.angle * 23;
  ctx.save();
  ctx.translate(this.position.x + this.offx, this.position.y + this.offy);
  //ctx.drawImage(this.img, 48+offset, 57, 23, 27, 0, 0, 23, 27);
  this.tile.render(elapasedTime, ctx);
  ctx.restore();
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function() {
  var position = Vector.add(this.position, {x:12+this.offx, y:this.offy});
  var velocity = Vector.scale({x:0, y:-1}, BULLET_SPEED);
  this.bullets.add(position, velocity);
}

Player.prototype.fireTriBullet = function(direction) {
  var position = Vector.add(this.position, {x:12+this.offx, y:this.offy});
  var velocity = Vector.scale({x:0, y:-1}, BULLET_SPEED);
  this.bullets.add(position, velocity);
  var velocity = Vector.scale({x:0.5, y:-1}, BULLET_SPEED);
  this.bullets.add(position, velocity);
  var velocity = Vector.scale({x:-0.5, y:-1}, BULLET_SPEED);
  this.bullets.add(position, velocity);
}

Player.prototype.fireQuadBullet = function(direction) {
  var position = Vector.add(this.position, {x:12+this.offx, y:this.offy});
  var velocity = Vector.scale({x:0, y:1}, BULLET_SPEED);
  this.bullets.add(position, velocity);
  var velocity = Vector.scale({x:0, y:-1}, BULLET_SPEED);
  this.bullets.add(position, velocity);
  var velocity = Vector.scale({x:-1, y:0}, BULLET_SPEED);
  this.bullets.add(position, velocity);
  var velocity = Vector.scale({x:1, y:0}, BULLET_SPEED);
  this.bullets.add(position, velocity);
}

Player.prototype.fireMegaBullet = function(direction) {
  this.fireTriBullet();
  this.fireQuadBullet();
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
