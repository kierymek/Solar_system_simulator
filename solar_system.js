var G = -6.67 * Math.pow(10, -11);
var Ms = 2 * Math.pow(10, 30);
var mercuryVelocity = 47*10**3;
var wenusVelocity = 35*10**3;
var earthVelocity = 30*10**3;
var marsVelocity = 26*10**3;
var jupiterVelocity = 24*10**3;
var saturnVelocity = 22*10**3;
var uranusVelocity = 20*10**3;
var neptuneVelocity = 18*10**3;

class Planet {
  coordsX = [];
  coordsY = [];
  constructor(x, y, velocityX, velocityY) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.coordsX.push(x);
    this.coordsY.push(y);
  }

  get getX(){
    return this.x;
  }

  get getY(){
    return this.y;
  }

  get getVelocityX(){
    return this.velocityX;
  }

  get getVelocityY(){
    return this.velocityY;
  }

  get coordsX() {
    return this.coordsX;
  }

  get coordsY() {
    return this.coordsY;
  }

  distance() {
    return Math.sqrt(this.x *10**9*this.x*10**9 + this.y*10**9*this.y*10**9);
  }

  accelerationX() {
    return this.x * 10**9 * G * Ms / (Math.pow(this.distance(), 3));
  }

  accelerationY() {
    return this.y * 10**9 * G * Ms / (Math.pow(this.distance(), 3));
  }

  set setX(x) {
    this.x = x;
    this.coordsX.push(x);
    if (this.coordsX.length > 500) {
      this.coordsX.shift();
    }
  }

  set setY(y) {
    this.y = y;
    this.coordsY.push(y);
    if (this.coordsY.length > 500) {
      this.coordsY.shift();
    }
  }

  set setVelocityY(velocityY) {
    this.velocityY = velocityY;
  }

  set setVelocityX(velocityX) {
    this.velocityX = velocityX;
  }
}

var mercury;
var wenus;
var earth;
var mars;
var jupiter;
var saturn;
var uranus;
var neptune;

var t0;
var timeDifference;
var xs;
var ys;
var stopped1 = false;
var stopped2 = false;

var myReq = null; 

function init() {
  var audio = document.getElementById('music');
  if (!stopped1 ) {
    mercury = new Planet(60, 0, 0, mercuryVelocity);
    wenus = new Planet(100, 0, 0, wenusVelocity);
    earth = new Planet(140, 0, 0, earthVelocity);
    mars = new Planet(200, 0, 0, marsVelocity);
    jupiter = new Planet(245, 0, 0, jupiterVelocity);
    saturn = new Planet(295, 0, 0, saturnVelocity);
    uranus = new Planet(350, 0, 0, uranusVelocity);
    neptune = new Planet(420, 0, 0, neptuneVelocity);
    audio.currentTime = 0;
    if( w !== undefined) {
      w.terminate();
      w = undefined;
    }
  }
  if(myReq != null) {
    window.cancelAnimationFrame(myReq);
  }
  t0 = performance.now();
  myReq = window.requestAnimationFrame(draw);
  if (audio.paused) {
    audio.play();
  }else{
      audio.currentTime = 0;
      audio.play();
  }
  stopped1 = false;
  stopped2 = false;
}

function stop() {
  if(myReq != null) {
    stopped1 = true;
    window.cancelAnimationFrame(myReq);
    document.getElementById('music').pause();
  }
}

function stop1() {
  if(myReq != null) {
    stopped2 = true;
    window.cancelAnimationFrame(myReq);
    document.getElementById('music').pause();
  }
}

function movePlanet(ctx, planet) {
  ctx.save();
  ctx.translate(450, 450);
  planet.setVelocityX = planet.getVelocityX + planet.accelerationX() * timeDifference;
  planet.setVelocityY = planet.getVelocityY + planet.accelerationY() * timeDifference;
  planet.setX = planet.getX + planet.getVelocityX * timeDifference/10**9;
  planet.setY = planet.getY + planet.getVelocityY * timeDifference/10**9;
  ctx.translate(planet.getX, planet.getY);
  ctx.beginPath();
}

function movePlanet2(ctx, planet, sun) {
  ctx.save();
  ctx.translate(450, 450);
  var distance = Math.sqrt((planet.getX - sun.getX)**2 *10**18 + (planet.getY - sun.getY)**2 *10**18);
  var accelerationX = (planet.getX - sun.getX)* 10**9 * G * Ms / (Math.pow(distance, 3));
  var accelerationY = (planet.getY - sun.getY) * 10**9 * G * Ms / (Math.pow(distance, 3));
  planet.setVelocityX = planet.getVelocityX + accelerationX * timeDifference;
  planet.setVelocityY = planet.getVelocityY + accelerationY * timeDifference;
  planet.setX = planet.getX + (planet.getVelocityX + sun.getVelocityX)* timeDifference/10**9;
  planet.setY = planet.getY + (planet.getVelocityY + sun.getVelocityY)* timeDifference/10**9;
  ctx.translate(planet.getX, planet.getY);
  ctx.beginPath();
}

function leaveTrace(ctx, planet) {
  ctx.restore();
  xs = planet.coordsX;
  ys = planet.coordsY;
  ctx.restore();
  for (var i = 0; i < xs.length && i < 3000; i++) {
    ctx.beginPath();
    ctx.arc(450 + xs[i], 450 + ys[i], 0.25, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#00BFFF';
    ctx.stroke();
  }
}

var w;

function worker_function() {
  var i = 0.;
  var offset;
  var time = 0;


  this.onmessage = function(event) {
      if (event.data !== undefined) {
          offset = event.data;
          time += offset / 1000 / 26364;
          postMessage(time);
        }
  }
}

function startWorker(val) {
  if (typeof(Worker) !== "undefined") {
    if (typeof(w) == "undefined") {
      w = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
    }
    w.postMessage(val);
    w.onmessage = function(event) {
      document.getElementById("result").innerHTML = event.data.toPrecision(4) + " lat ziemskich";
    };
  } else {
    document.getElementById("result").innerText = "Sorry! No Web Worker support.";
    document.getElementById("result").textContent = "Sorry! No Web Worker support.";
  }
}

function draw() {
  var ctx = document.getElementById('canvas').getContext('2d');

  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, 900, 900); // clear canvas

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';

  // Earth
  var time = new Date();
  var t1 = performance.now();
  timeDifference = (t1 - t0) * 1000;
  movePlanet(ctx, earth);
  ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'blue';
  ctx.fill();

  startWorker(timeDifference);

  // Moon
  ctx.save();
  ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
  ctx.translate(0, 18);
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'white';
  ctx.fill();
  leaveTrace(ctx, earth);

  // Wenus
  ctx.restore();
  movePlanet(ctx, wenus);
  ctx.arc(0, 0, 8, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'purple';
  ctx.fill();
  leaveTrace(ctx, wenus);

  //Mercury
  movePlanet(ctx, mercury);
  ctx.arc(0, 0, 6, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'orange';
  ctx.fill();
  leaveTrace(ctx, mercury);

  //Mars
  movePlanet(ctx, mars);
  ctx.arc(0, 0, 8, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'red';
  ctx.fill();
  leaveTrace(ctx, mars);

  //Jupiter
  movePlanet(ctx, jupiter);
  ctx.arc(0, 0, 18, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'brown';
  ctx.fill();
  leaveTrace(ctx, jupiter);

  //Saturn
  movePlanet(ctx, saturn);
  ctx.arc(0, 0, 16, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#F5F5DC';
  ctx.fill();
  leaveTrace(ctx, saturn);

  //Uranus
  movePlanet(ctx, uranus);
  ctx.arc(0, 0, 14, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#5F9EA0';
  ctx.fill();
  leaveTrace(ctx, uranus);
  
  //Neptune
  movePlanet(ctx, neptune)
  ctx.arc(0, 0, 13, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#7FFFD4';
  ctx.fill();
  leaveTrace(ctx, neptune);

  // Sun
  ctx.beginPath();
  ctx.arc(450, 450, 35, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'yellow';
  ctx.fill();
 
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 900, 900);
 
  t0 = t1;
  myReq = window.requestAnimationFrame(draw);
}

function init2() {
  var audio = document.getElementById('music');
  if (!stopped2) {
    mercury1 = new Planet(-80, 0, 0, 47*10**3);
    wenus1 = new Planet(-40, 0, 0, 35*10**3);
    mars1 = new Planet(100, 0, 0, 24*10**3);
    sun1 = new Planet(-150, 0, 0, -earthVelocity)
    audio.currentTime = 0;
    if( w !== undefined) {
      w.terminate();
      w = undefined;
    }
  }
  if(myReq != null) {
    window.cancelAnimationFrame(myReq);
  }
  t0 = performance.now();
  myReq = window.requestAnimationFrame(draw2);
  if (audio.paused) {
    audio.play();
  }else{
      audio.currentTime = 0;
      audio.play();
  }
  stopped1 = false;
  stopped2 = false;
}

var mercury1 = new Planet(-80, 0, 0, 47*10**3);
var wenus1 = new Planet(-40, 0, 0, 35*10**3);
var mars1 = new Planet(100, 0, 0, 24*10**3);
var sun1 = new Planet(-150, 0, 0, -earthVelocity)

function draw2() {
  var ctx = document.getElementById('canvas').getContext('2d');

  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, 900, 900); // clear canvas

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';

  // Earth
  var time = new Date();
  var t1 = performance.now();
  timeDifference = (t1 - t0) * 1000;
  ctx.save();
  ctx.translate(450, 450);
  ctx.arc(0, 0, 12, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'blue';
  ctx.fill();

  startWorker(timeDifference / 1.2);

  // Moon
  ctx.save();
  ctx.rotate(((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
  ctx.translate(0, 18);
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Wenus
  ctx.restore();
  ctx.restore();
  movePlanet2(ctx, wenus1, sun1);
  ctx.arc(0, 0, 8, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'purple';
  ctx.fill();
  leaveTrace(ctx, wenus1);

  //Mercury
  movePlanet2(ctx, mercury1, sun1);
  ctx.arc(0, 0, 6, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'orange';
  ctx.fill();
  leaveTrace(ctx, mercury1);

  //Mars
  movePlanet2(ctx, mars1, sun1);
  ctx.arc(0, 0, 8, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'red';
  ctx.fill();
  leaveTrace(ctx, mars1);


  // Sun
  ctx.save();
  ctx.translate(450, 450);
  var distance = Math.sqrt((sun1.getX)**2 *10**18 + (sun1.getY)**2 *10**18);
  var accelerationX = sun1.getX * 10**9 * G * Ms / (Math.pow(distance, 3));
  var accelerationY = sun1.getY * 10**9 * G * Ms / (Math.pow(distance, 3));
  sun1.setVelocityX = sun1.getVelocityX + accelerationX * timeDifference;
  sun1.setVelocityY = sun1.getVelocityY + accelerationY * timeDifference;
  sun1.setX = sun1.getX + sun1.getVelocityX * timeDifference/10**9;
  sun1.setY = sun1.getY + sun1.getVelocityY * timeDifference/10**9;
  ctx.translate(sun1.getX, sun1.getY);
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  leaveTrace(ctx, sun1);
 
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 900, 900);
 
  t0 = t1;
  myReq = window.requestAnimationFrame(draw2);
}
