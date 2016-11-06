"use strict";

module.exports = exports = {Effect : Effect, RealParam : RealParam, NamedParams : NamedParams};

//a class to draw a part of an image
function Effect(render, params, lifetime, rate) {
  this.time = 0;
  this.toEmit = 0;
  this.render = render;
  this.params = params;
  this.lifetime = lifetime; //this is not a parameter because it dictates removale from the system
     //in general you could have these be randomized I'm just lazy
  this.rate = rate; //this is not a parameter because it dictates addition to the system
  this.system = [];
}

Effect.prototype.update = function(elapasedTime) {
  this.time += elapsedTime;
  var self = this;
  this.system = this.system.filter(function(particle) {
    return (self.time - particle.time) > this.lifetime;
  });
  this.toEmit += elapsedTime * this.rate;
  while(this.toEmit >= 1) {
    this.system.push({params:params.new(), time:this.time});
  }
}

Effect.prototype.render = function(elapasedTime, ctx) {
  var self = this;
  this.system.forEach(function (particle) {
    self.render(self.time - particle.time, particle.params);
  });
}

function rand(a, b) {
  return Math.random() * (b - a) + a
}

function RealParam(a, b) {
  this.a = a;
  this.b = b;
}

RealParam.prototype.new = function() {
  return rand(this.a, this.b);;
}

function NamedParams(dict) {
  this.dict = dict;
}

NamedParams.prototype.new = function() {
  var out = {};
  for(var key in this.dict) {
    out[key] = this.dict[key].new(); //call the needed 'new' method
  }
}
