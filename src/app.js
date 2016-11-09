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

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
}
