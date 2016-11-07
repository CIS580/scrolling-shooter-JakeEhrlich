"use strict";

/**
 * @module SmokeParticles
 * A class for managing a particle engine that
 * emulates a smoke trail
 */
module.exports = exports = SmokeParticles;

const xidx = 0;
const yidx = 1;
const vxidx = 2;
const vyidx = 3;
const timeidx = 4;
const size = 5;

/**
 * @constructor SmokeParticles
 * Creates a SmokeParticles engine of the specified size
 * @param {uint} size the maximum number of particles to exist concurrently
 */
function SmokeParticles(maxSize) {
  this.pool = new Float32Array(size * maxSize);
  this.start = 0;
  this.end = 0;
  this.max = size * maxSize;
}



/**
 * @function emit
 * Adds a new particle at the given position
 * @param {Vector} position
*/
SmokeParticles.prototype.emit = function(position, vol) {
  var idx = this.end % this.max;
  this.pool[idx + xidx] = position.x;
  this.pool[idx + yidx] = position.y;
  this.pool[idx + vxidx] = vol.x;
  this.pool[idx + vyidx] = vol.y;
  this.pool[idx + timeidx] = 0.0;
  this.end = (this.end + size) % this.max;
  if(this.end == this.start) this.start = (this.start + size) % this.max;
}

/**
 * @function update
 * Updates the particles
 * @param {DOMHighResTimeStamp} elapsedTime
 */
SmokeParticles.prototype.update = function(elapsedTime) {
  function updateParticle(idx) {
    this.pool[idx + xidx] += elapsedTime * this.pool[idx + vxidx];
    this.pool[idx + yidx] += elapsedTime * this.pool[idx + vyidx];
    this.pool[idx + timeidx] += elapsedTime;
    if(this.pool[idx+timeidx] > 2500) this.start = idx;
  }
  var start = this.start;
  for(var i = this.start % this.max; i != this.end % this.max; i = (i + size) % this.max) {
    updateParticle.call(this, i);
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
SmokeParticles.prototype.render = function(elapsedTime, ctx) {
  function renderParticle(idx) {
    var alpha = 1 - (this.pool[idx + timeidx] / 2500);
    //range the red from grey to full red
    var red = 100 + Math.floor((255 - 100) * alpha);
    var other = Math.floor((1 - alpha) * 180);
    var radius = 0.1 * this.pool[idx + timeidx];
    if(radius > 5) radius = 5;
    ctx.beginPath();
    ctx.arc(
      this.pool[idx + xidx],   // X position
      this.pool[idx + yidx], // y position
      radius, // radius
      0,
      2*Math.PI
    );
    ctx.fillStyle = 'rgba('+red+','+(other+40)+','+other+',' + alpha + ')';
    ctx.fill();
  }
  for(var i = this.start % this.max; i != this.end % this.max; i = (i + size) % this.max) {
    renderParticle.call(this, i);
  }
}
