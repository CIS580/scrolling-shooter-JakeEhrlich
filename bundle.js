(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const BulletPool = require('./bullet_pool');
const Cloud = require('./cloud');
const Background = require('./background');
const SmokeParticles = require('./smoke_particles')
const Wheel = require('./wheel');
const Kamakazi = require('./kamakazi');
const Sine = require('./sine');
const Turret = require('./turret');
const Kreeper = require('./kreeper');
const Powerup = require('./powerup');
const Level1 = require('./level1');
const Level2 = require('./level2');
const Level0 = require('./level0');

/* Global variables */
var canvas = document.getElementById('screen');
var clouds = [];
var camera = new Camera(canvas);
var bads = [];
for(var i = 0; i < 10; ++i) {
  var x = Math.random() * canvas.width;
  var y = Math.random() * canvas.height;
  //console.log(x, y);
  clouds.push(new Cloud({x:x,y:y}, camera));
}
var game = new Game(canvas, update, render);
var input = {
  up: false,
  down: false,
  left: false,
  right: false
}

var background = new Background(camera);
var bullets = new BulletPool(60);
var badbullets = new BulletPool(500);
var missiles = [];
var player = new Player(bullets, missiles);
var smoke = new SmokeParticles(3000);
var level = new Level0(bads, player, smoke, badbullets);
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
for(var i = 0; i < 1; ++i) {
  var pos = {x:Math.random() * 1000, y : -Math.random() * 10000};
  bads.push(new Powerup(pos, 2, mega, player));
}
/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
  }
}

function explode(x, y) {
  for(var i = 0; i < 50; ++i) {
    var theta = Math.random() * 2 * Math.PI;
    var mag = Math.random() * 0.1;
    var vx = mag * Math.cos(theta);
    var vy = mag * Math.sin(theta);
    smoke.emit({x:x + player.position.x, y:y + player.position.y}, {x:vx, y:vy});
  }
}
/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "Space":
    case " ":
      //console.log("got here!");
      player.fire();
      break;
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


var onscreen = [];
/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  smoke.update(elapsedTime);
  // update the player
  if(!player.update(elapsedTime, input)) {
    clouds = []; //show player where stuff was
  }

  // update the camera
  player.position.y -= 0.1 * elapsedTime;
  camera.update(player.position);
  clouds.forEach(function(cloud) {file:///home/jake/Games/scrolling-shooter-JakeEhrlich/index.html
    cloud.update(elapsedTime);
  });
  var keep = [];
  onscreen = [];
  bads.forEach(function(bad) {
    if(!bad.update(elapsedTime)) {
       keep.push(bad);
    }
    if(camera.onScreen(bad)) onscreen.push(bad);
  });
  bads = keep;
  // Update bullets
  bullets.update(elapsedTime, function(bullet){
    var good = true;
    onscreen.forEach(function(bad) {
      if(bullet.x > bad.x && bullet.y > bad.y && bullet.x < bad.x + bad.width && bullet.y < bad.y + bad.height) {
        bad.health -= 10;
        good = false;
      }
    });
    if(!good) return true;
    if(!camera.onScreen(bullet)) {
      //console.log("removed!");
      return true;
    }
    return false;
  });
  badbullets.update(elapsedTime, function(bullet){
    var py = player.position.y + player.offy;
    var px = player.position.x + player.offx;
    var pw = 28;
    var ph = 28;
    //console.log(py, px, pw, ph);
    if(bullet.x > px && bullet.y > py && bullet.x < px + pw && bullet.y < py + ph) {

      player.health -= 1;

      return true;
    }
    if(!camera.onScreen(bullet)) {
      //console.log("removed!");
      return true;
    }
    return false;
  });

  level = level.update(bads);
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 786);

  // TODO: Render background

  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    background.render(elapsedTime, ctx);
    // Render the bullets
    bullets.render(elapsedTime, ctx);
    badbullets.render(elapsedTime, ctx);
    //render particle effects
    smoke.render(elapsedTime, ctx);
    bads.forEach(function(bad) {
      if(camera.onScreen(bad)) bad.render(elapsedTime, ctx);
    });
    // Render the player
    player.render(elapsedTime, ctx);
    //render clouds on top of everything to remove information
    //from the player
    clouds.forEach(function(cloud) {
      if(camera.onScreen(cloud)) cloud.render(elapsedTime, ctx);
    });
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
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
  drawStroked(ctx, "health: " + player.health, 30, 50);
  drawStroked(ctx, "level: " + level.num, 800, 50);
  if(level.win) {
    drawStroked(ctx, "WIN!", 400, 400);
  }
}

},{"./background":2,"./bullet_pool":3,"./camera":4,"./cloud":5,"./game":6,"./kamakazi":7,"./kreeper":8,"./level0":9,"./level1":10,"./level2":11,"./player":12,"./powerup":13,"./sine":14,"./smoke_particles":15,"./turret":18,"./vector":19,"./wheel":20}],2:[function(require,module,exports){
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

},{"./tilemap":17}],3:[function(require,module,exports){
"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x;
    this.pool[4*this.end+1] = position.y;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of bullets by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "white";
  for(var i = 0; i < this.end; i++) {
    //console.log("bullet!");
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.arc(this.pool[4*i], this.pool[4*i+1], 2, 0, 2*Math.PI);
  }
  ctx.fill();
  ctx.restore();
}

},{}],4:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');

/**
 * @module Camera
 * A class representing a simple camera
 */
module.exports = exports = Camera;

/**
 * @constructor Camera
 * Creates a camera
 * @param {Rect} screen the bounds of the screen
 */
function Camera(screen) {
  this.x = 0;
  this.y = 0;
  this.width = screen.width;
  this.height = screen.height;
}

/**
 * @function update
 * Updates the camera based on the supplied target
 * @param {Vector} target what the camera is looking at
 */
Camera.prototype.update = function(target) {
  this.y = target.y;
}

/**
 * @function onscreen
 * Determines if an object is within the camera's gaze
 * @param {Vector} target a point in the world
 * @return true if target is on-screen, false if not
 */
Camera.prototype.onScreen = function(target) {
  var height = target.height ? target.height : 0;
  return (
     target.x > this.x &&
     target.x < this.x + this.width &&
     target.y + height > this.y &&
     target.y < this.y + this.height
   );
}

/**
 * @function toScreenCoordinates
 * Translates world coordinates into screen coordinates
 * @param {Vector} worldCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toScreenCoordinates = function(worldCoordinates) {
  return Vector.subtract(worldCoordinates, this);
}

/**
 * @function toWorldCoordinates
 * Translates screen coordinates into world coordinates
 * @param {Vector} screenCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toWorldCoordinates = function(screenCoordinates) {
  return Vector.add(screenCoordinates, this);
}

},{"./vector":19}],5:[function(require,module,exports){
"use strict";

module.exports = exports = Cloud;
const Tile = require('./tile');

//a class to draw a part of an image
function Cloud(position, camera) {
  this.camera = camera;
  this.x = position.x;
  this.y = position.y;
  var tile = {x:80, y:305, width:170-80, height:460-305, scaleX:170-80, scaleY:460-305};
  this.width = tile.width;
  this.height = tile.height;
  this.img = new Image();
  this.img.src = 'assets/shapesy.png';
  this.tile = new Tile(tile, this.img);
}

Cloud.prototype.update = function(elapasedTime, ctx) {
  this.y += 0.1 * elapasedTime;
  if(this.y > this.camera.y + this.camera.height) {
    this.x = Math.random() * 1000;
    this.y = this.camera.y - 120 - Math.random() * (800 - 120);
  }
}

Cloud.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  this.tile.render(elapasedTime, ctx);
  ctx.restore();
}

},{"./tile":16}],6:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],7:[function(require,module,exports){
"use strict";

module.exports = exports = Kamakazi;
const Tilemap = require('./tilemap');

function explode(smoke, x, y) {
  for(var i = 0; i < 50; ++i) {
    var theta = Math.random() * 2 * Math.PI;
    var mag = Math.random() * 0.5;
    var vx = mag * Math.cos(theta);
    var vy = mag * Math.sin(theta);
    smoke.emit({x:x, y:y}, {x:vx, y:vy});
  }
}

//a class to draw a part of an image
function Kamakazi(position, player, smoke) {
  this.health = 50;
  this.smoke = smoke;
  this.x = position.x;
  this.y = position.y;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/ships.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = 0;
  this.idx = 0;
  this.player = player;
}

Kamakazi.prototype.update = function(elapasedTime, ctx) {
  //console.log(this.player);
  var px = this.player.position.x + this.player.offx;
  var py = this.player.position.y + this.player.offy;
//  console.log(px, py);
  if(this.player.position.y - this.y < 500) {
    this.x += 0.1 * elapasedTime * Math.sign(px - this.x);
    this.y += 0.2 * elapasedTime;
  }

  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  if(px > this.x && py > this.y && px < this.x + this.width && py < this.y + this.height) {
    explode(this.smoke, this.x, this.y);
    this.player.health -= 20;
    return true;
  }
  return this.health <= 0;
}

Kamakazi.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(47, ctx);
  ctx.restore();
}

},{"./tilemap":17}],8:[function(require,module,exports){
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

},{"./tilemap":17}],9:[function(require,module,exports){
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

},{"./kamakazi":7,"./kreeper":8,"./level1":10,"./powerup":13,"./sine":14,"./smoke_particles":15,"./turret":18,"./wheel":20}],10:[function(require,module,exports){
"use strict";

module.exports = exports = Level1;

const SmokeParticles = require('./smoke_particles')
const Wheel = require('./wheel');
const Kamakazi = require('./kamakazi');
const Sine = require('./sine');
const Turret = require('./turret');
const Kreeper = require('./kreeper');
const Powerup = require('./powerup');
const Level2 = require('./level2');


//a class to draw a part of an image
function Level1(bads, player, smoke, badbullets) {
  this.num = 1;
  this.bads = bads;
  this.player = player;
  this.smoke = smoke;
  this.badbullets = badbullets;
  for(var i = 0; i < 19; ++i) {
    bads.push(new Wheel({x:1000*i/20, y:-700}, player, smoke));
  }
  for(var i = 0; i < 19; ++i) {
    bads.push(new Wheel({x:1000*i/20, y:-740}, player, smoke));
  }
  for(var i = 0; i < 50; ++i) {
    var y = -Math.random() * 200 - 1000;
    bads.push(new Kamakazi({x:1000*i/20, y:y}, player, smoke));
  }
  for(var i = 0; i < 19; ++i) {
    var y = -Math.random() * 200 - 1200;
    bads.push(new Kreeper({x:1000*i/20, y:y}, player, smoke));
  }
  for(var i = 0; i < 5; ++i) {
    var y = -Math.random() * 200 - 1500;
    bads.push(new Sine({x:1000*i/5, y:y}, badbullets));
  }
  for(var i = 0; i < 19; i+=2) {
    bads.push(new Wheel({x:1000*i/20, y:-2000}, player, smoke));
  }
  for(var i = 1; i < 19; i+=2) {
    bads.push(new Wheel({x:1000*i/20, y:-2040}, player, smoke));
  }
  for(var i = 0; i < 19; i+=2) {
    bads.push(new Wheel({x:1000*i/20, y:-2080}, player, smoke));
  }
  for(var i = 0; i < 75; ++i) {
    var y = -Math.random() * 1000 - 2000;
    bads.push(new Kamakazi({x:1000*i/20, y:y}, player, smoke));
  }
  var y = -2020;
  for(var i = 0; i < 19; ++i) {
    bads.push(new Kreeper({x:1000*i/20, y:y+20*i}, player, smoke));
  }
  for(var i = 0; i < 19; ++i) {
    bads.push(new Kreeper({x:1000*i/20, y:y-20*i}, player, smoke));
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

Level1.prototype.update = function(bads) {
  var py = this.player.position.y + this.player.offy;
  if(py < -2500) {
    console.log("next level!");
    while(bads.length > 0) bads.pop();
    rebuild(bads, this.player);
    this.player.health = 100;
    this.player.position.y = 0;
    return new Level2(bads, this.player, this.smoke, this.badbullets);
  }
  return this;
}

},{"./kamakazi":7,"./kreeper":8,"./level2":11,"./powerup":13,"./sine":14,"./smoke_particles":15,"./turret":18,"./wheel":20}],11:[function(require,module,exports){
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
  this.win = false;
  this.num = 2;
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
    this.win = true;
    console.log("nextity lebvel yall");
    return this;
  }
  return this;
}

},{"./kamakazi":7,"./kreeper":8,"./powerup":13,"./sine":14,"./smoke_particles":15,"./turret":18,"./wheel":20}],12:[function(require,module,exports){
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

},{"./tile":16,"./vector":19}],13:[function(require,module,exports){
"use strict";

module.exports = exports = Powerup;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Powerup(position, idx, method, player) {
  this.method = method;
  this.player = player;
  this.x = position.x;
  this.y = position.y;
  this.width = 12;
  this.height = 12;
  this.img = new Image();
  this.img.src = 'assets/bullets.png';
  this.tmap = new Tilemap(this.img, 12, 12);
  this.timer = 0;
  this.idx = idx;
}

Powerup.prototype.update = function(elapasedTime, ctx) {
  this.y += 0.05 * elapasedTime;
  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  if(px > this.x - 10 && py > this.y - 10 && px < this.x + this.width + 10 && py < this.y + this.height + 10) {
    this.player.fire = this.method;
    return true;
  }
}

Powerup.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  this.tmap.render(this.idx, ctx);
  ctx.restore();
}

},{"./tilemap":17}],14:[function(require,module,exports){
"use strict";

module.exports = exports = Sine;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Sine(position, bullets) {
  this.health = 30;
  this.x = position.x;
  this.basex = this.x;
  this.y = position.y;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/ships.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = Math.random() * Math.PI * 400;
  this.idx = 0;
  this.freq = 0.005;
  this.firerate = (3 * Math.random() + 2) / 1000;
  this.toshoot = 0;
  this.amp = 20;
  this.bullets = bullets;
}

Sine.prototype.update = function(elapasedTime, ctx) {
  this.toshoot += this.firerate * elapasedTime;
  while(this.toshoot > 1) {
    //console.log("fire!");
    this.bullets.add({x:this.x, y:this.y}, {x:0, y:4});
    this.toshoot -= 1;
  }
  this.timer += elapasedTime;
  this.x = this.basex + this.amp * Math.sin(this.freq * this.timer);
  this.y += 0.05 * elapasedTime;
  return this.health <= 0;
}

Sine.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(3, ctx);
  ctx.restore();
}

},{"./tilemap":17}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
"use strict";

module.exports = exports = Tilemap;

//a class to draw a part of an image
function Tilemap(img, tx, ty) {
  this.img = img;
  this.tx = tx;
  this.ty = ty;
  this.tw = Math.floor(this.img.width / this.tx);
}

Tilemap.prototype.render = function(idx, ctx, sx, sy) {
  if(!sx) sx = 0;
  if(!sy) sy = 0;
  if(!this.tw) this.tw = Math.floor(this.img.width / this.tx);
  var y = Math.floor(idx / this.tw) * this.ty;
  var x = (idx % this.tw) * this.tx;
  ctx.drawImage(this.img, x, y, this.tx, this.ty, sx, sy, this.tx, this.ty);
}

},{}],18:[function(require,module,exports){
"use strict";

module.exports = exports = Turret;
const Tilemap = require('./tilemap');

//a class to draw a part of an image
function Turret(position, bullets) {
  this.bullets = bullets;
  this.x = position.x;
  this.y = position.y;
  this.width = 24;
  this.height = 28;
  this.img = new Image();
  this.img.src = 'assets/ships.png';
  this.tmap = new Tilemap(this.img, 24, 28);
  this.timer = 0;
  this.idx = 0;
  this.firerate = 4 / 1000;
  this.toshoot = 0;
  this.health = 9;
}

Turret.prototype.update = function(elapasedTime, ctx) {
  this.timer += elapasedTime;
  this.toshoot += this.firerate * elapasedTime;
  while(this.toshoot > 1) {
    //console.log("fire!");
    var theta = this.timer*0.001;
    var vx = 4*Math.cos(theta);
    var vy = 4*Math.sin(theta);
    this.bullets.add({x:this.x, y:this.y}, {x:vx, y:vy});
    this.toshoot -= 1;
  }
  return this.health < 0;
}

Turret.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(20, ctx);
  ctx.restore();
}

},{"./tilemap":17}],19:[function(require,module,exports){
"use strict";

/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  add: add,
  subtract: subtract,
  scale: scale,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}


/**
 * @function rotate
 * Scales a vector
 * @param {Vector} a - the vector to scale
 * @param {float} scale - the scalar to multiply the vector by
 * @returns a new vector representing the scaled original
 */
function scale(a, scale) {
 return {x: a.x * scale, y: a.y * scale};
}

/**
 * @function add
 * Computes the sum of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed sum
*/
function add(a, b) {
 return {x: a.x + b.x, y: a.y + b.y};
}

/**
 * @function subtract
 * Computes the difference of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed difference
 */
function subtract(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

},{}],20:[function(require,module,exports){
"use strict";

module.exports = exports = Wheel;
const Tilemap = require('./tilemap');

function explode(smoke, x, y) {
  for(var i = 0; i < 50; ++i) {
    var theta = Math.random() * 2 * Math.PI;
    var mag = Math.random() * 0.5;
    var vx = mag * Math.cos(theta);
    var vy = mag * Math.sin(theta);
    smoke.emit({x:x, y:y}, {x:vx, y:vy});
  }
}

//a class to draw a part of an image
function Wheel(position, player, smoke) {
  this.player = player;
  this.health = 100;
  this.smoke = smoke;
  this.x = position.x;
  this.y = position.y;
  this.width = 48;
  this.height = 48;
  this.img = new Image();
  this.img.src = 'assets/spinny.png';
  this.tmap = new Tilemap(this.img, 48, 48);
  this.timer = 0;
  this.idx = 0;
}

Wheel.prototype.update = function(elapasedTime, ctx) {
  this.y += 0.05 * elapasedTime;
  this.timer += elapasedTime;
  if(this.timer > 25) {
    this.idx++;
    this.timer = 0;
  }
  if(this.idx == 4) this.idx = 0;
  var py = this.player.position.y + this.player.offy;
  var px = this.player.position.x + this.player.offx;
  if(px > this.x && py > this.y && px < this.x + this.width && py < this.y + this.height) {
    explode(this.smoke, this.x, this.y);
    this.player.health -= 50;
    return true;
  }
  return this.health < 0;
}

Wheel.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.x, this.y); //get paralax
  //console.log(this.x, this.y, this.idx);
  this.tmap.render(this.idx, ctx);
  ctx.restore();
}

},{"./tilemap":17}]},{},[1]);
