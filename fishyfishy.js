/*

disclaimer:

This code works best on repl.it if the audio bits are commented out, lots of lag on the p5.js editor unfortunately :(
I tried using codepen.io as well, but I couldn't get the audio to work there either, even though I added the appropriate scripts to the index.html file head. The sound response is most fun when the code is running without too much lag, but I think updating the water droplets and shark movements constantly might be too much of a load on the p5.js editor.

design inspiration:

I was hoping to create something like a koi pond/zen garden with
relaxing, cool colors and images in the form of a tiny ocean.
The user can mouse over the waves to get them to change
direction and color, and can click on the sharks to make them
disperse, based on the proximity to the mouse and their original
speed. I was inspired by an interactive koi pond I saw in a 
museum a few years ago, shown in the following YouTube video:
https://www.youtube.com/watch?v=E-zg-0gwkJM. 
In order to make it exciting, I added party mode!

hope you enjoy(:

sources:

1.https://ccc.designprogramming.io/challenges/microphone-input-and-analysis
2.https://ccc.designprogramming.io/challenges/custom-constructors
3.https://p5js.org/examples/interaction-wavemaker.html

*/

let water = []; //array of droplets
let amplitude, mic;
let sharks = []; //array of sharks
let sharksNum = 7; //number of sharks
let distance;
let multiplier; //adjusts for window size

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  multiplier = windowWidth/400;

  for (let i = 0; i < sharksNum; i++) {
    sharks[i] = new Shark(random(0, width), random(0, height), random(0.03, 0.1));
  }

  let i = 0;
  for (let j = -50; j < width + 50; j += 10*multiplier) {
    for (let k = -50; k < height + 50; k += 10*multiplier) {
      water[i] = new waterDroplet(j, k);
      i++;
    }
  }


  //create audio-in obj. (source 1)
  mic = new p5.AudioIn();
  mic.start();
  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);

}

function startScreen() {
  multiplier = windowWidth/400;
  textSize(28 * multiplier);
  textAlign(CENTER);
  fill(255);
  text('welcome to tiny ocean', width / 2, height / 2 - (30 * multiplier));
  textSize(10 * multiplier);
  fill(138, 196, 202);
  text('move the mouse to move the waves & their color', width / 2, height / 2);
  fill(179, 215, 220);
  text('press & hold the mouse to scare the sharks(:', width / 2, height / 2 + (15 * multiplier));
  fill(145, 190, 220);
  text('make noise to make them go faster!', width / 2, height / 2 + (30 * multiplier));
  fill(173, 216, 230);
  text('play the *Jaws* theme song to laugh', width / 2, height / 2 + (45 * multiplier));
  fill(240, 248, 255);
  text('press any key for ~ PARTY MODE ~', width / 2, height / 2 + (75 * multiplier));
  fill(107, 127, 136);

}

function draw() {
  background(33, 44, 64);

  for (let i = 0; i < sharksNum; i++) {
    sharks[i].update();
  }


  for (let i = 0; i < water.length; i++) {
    water[i].update();
  }


  if (frameCount < 200) {
    startScreen();
  }

}

class Shark {

  //creates the object
  constructor(x, y, size) {

    multiplier = windowWidth/400;
    this.x = x;
    this.y = y;
    this.wid = width / (1 / size);
    this.angle = 3.0;
    //random speed for each shark
    this.speed = random(0.2, 0.9) * multiplier/1.5;
    //random blue-grey color for each shark
    this.r = random(115, 120);
    this.g = random(130, 140);
    this.b = random(137, 155);
    this.color = color(this.r, this.g, this.b);
    this.n = 20;
    this.dorsalFinColor = color(this.r - this.n, this.g - this.n, this.b - this.n);
    this.origColor = this.color;
    this.origDorsalColor = this.dorsalFinColor;

  }

  //moves the tail and x-pos of the shark
  update() {
    this.moveTail();
    this.swim();
    this.partyMode();
    this.show();

  }

  //using custom shapes to display the shark
  //source 2 helped with custom shapes
  show() {
    noStroke();
    fill(this.color);
    //front of the shark
    beginShape();
    vertex(this.x - this.wid, this.y - (this.wid / 2.5));
    vertex(this.x - this.wid * 1.15, this.y - this.wid);
    vertex(this.x - this.wid * .65, this.y - this.wid * .8);
    vertex(this.x - this.wid * .3, this.y - (this.wid / 2));
    vertex(this.x, this.y - (this.wid / 2));
    vertex(this.x + (this.wid / 1.8), this.y - (this.wid / 2.5));
    vertex(this.x + this.wid, this.y);
    vertex(this.x + (this.wid / 1.8), this.y + (this.wid / 2.5));
    vertex(this.x, this.y + (this.wid / 2));
    vertex(this.x - this.wid * .3, this.y + (this.wid / 2));
    vertex(this.x - this.wid * .65, this.y + this.wid * .8);
    vertex(this.x - this.wid * 1.15, this.y + this.wid);
    vertex(this.x - this.wid, this.y + (this.wid / 2.5));
    endShape();
    //moving the lower body of the shark
    push();
    translate(this.x, this.y);
    //using cosine to make smooth cyclical movements
    rotate(cos(this.angle) * .2);
    //the middle of the shark
    beginShape();
    vertex(-this.wid * .6, -this.wid / 3);
    vertex(-this.wid, -this.wid / 2.5);
    vertex(-this.wid * 2.15, -this.wid / 4.5);
    vertex(-this.wid * 2.65, -this.wid / 7);
    vertex(-this.wid * 2.65, this.wid / 7);
    vertex(-this.wid * 2.15, this.wid / 4.5);
    vertex(-this.wid, this.wid / 2.5);
    vertex(-this.wid * .6, this.wid / 3);
    endShape();
    //rotating again to differentiate movement
    //not entirely realistic, but it's part of the aesthetic
    rotate(-cos(this.angle) * 0.04);
    //the tail of the shark
    beginShape();
    vertex(-this.wid * 2.5, -this.wid / 7);
    vertex(-this.wid * 3, -this.wid / 9);
    vertex(-this.wid * 5, -this.wid / 5);
    vertex(-this.wid * 3, this.wid / 9);
    vertex(-this.wid * 2.5, this.wid / 7);
    endShape();
    pop();
    //dorsal fin
    fill(this.dorsalFinColor);
    beginShape();
    vertex(this.x + (this.wid / 4), this.y);
    vertex(this.x - (this.wid / 1.2), this.y - (this.wid / 5));
    vertex(this.x - (this.wid / 1.5), this.y);
    endShape();
    //fill(355);
    //text(this.speed,this.x,this.y);

  }

  //updates the angle to keep the tail moving
  moveTail() {
    if(windowWidth <= 500){
      this.angle += 0.05;
    } else {
      this.angle += 0.05 * multiplier/4;
    }
  }

  //makes them colorful and FAST
  partyMode() {
    if (keyIsPressed) {
      this.r = random(255);
      this.g = random(255);
      this.b = random(255);
      this.color = color(this.r, this.g, this.b);
      this.dorsalFinColor = color(this.r - this.n, this.g - this.n, this.b - this.n);
      this.x += 20 * multiplier;
    } else {
      this.color = this.origColor;
      this.dorsalFinColor = this.origDorsalColor;
    }
  }

  //moves the shark forward
  swim() {

    //moves faster if you yell!
    //hilarous if you play the Jaws theme song(;
    this.level = amplitude.getLevel();

    //loops around if it goes off screen
    if (this.x - (this.wid * 4.5) > width) {
      this.x -= width * 1.5;
      this.y = random(0, height);
    } else {
      this.x += this.speed + (this.level * 100) * multiplier;
    }

    //run away from mouse
    if (mouseIsPressed) {
      distance = dist(this.x, this.y, mouseX, mouseY);
      let scaredFactor = (100/distance)*multiplier;
      if (this.y < mouseY) {
        this.y -= this.speed * scaredFactor;
      } else if (this.y > mouseY) {
        this.y += this.speed * scaredFactor;
      }

      if (this.x < mouseX) {
        this.x -= this.speed * scaredFactor;
      } else if (this.x >= mouseX) {
        this.x += this.speed * scaredFactor;
      }
    }

  }

}

class waterDroplet {

  constructor(x, y) {
    multiplier = windowWidth/800;
    const origX = x;
    const origY = y;
    this.x = x;
    this.y = y;
    this.t = 0;
    this.color = color(121, 141, 136);
  }

  //updates time, moves, and shows droplet
  update() {
    this.t += 0.01*multiplier;
    this.move();
    this.changeColor();
    this.show();
  }

  //moves droplets based on mouse
  //source 3 for ocean wave movement
  move() {
    this.angleX = map(mouseX, 0, width, -4 * PI, 4 * PI, true);
    this.angleY = map(mouseY, 0, height, -4 * PI, 4 * PI, true);
    this.angle = this.angleX * (this.x / width) + this.angleY * (this.y / height);
    this.dropletX = this.x + 20 * cos(2 * PI * this.t + this.angle);
    this.dropletY = this.y + 20 * sin(2 * PI * this.t + this.angle);
  }

  changeColor() {
    if (!keyIsPressed) {
      distance = dist(this.dropletX, this.dropletY, this.origX, this.origY);
      this.color = color(-abs(this.angle*multiplier) * 20 + 121, 170, abs((this.angle*multiplier) * 10 + 136));
    } else {
      this.partyMode();
    }
  }

  partyMode() {
    if (keyIsPressed) {
      this.color = color(random(255), random(255), random(255));
    } else {
      this.color = color(121, 141, 136);
    }
  }

  //displays droplet
  show() {

    fill(this.color);
    ellipse(this.dropletX, this.dropletY, 2);

  }

}
