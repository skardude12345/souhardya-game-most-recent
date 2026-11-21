const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Bounds = Matter.Bounds;
const Constraint = Matter.Constraint;

var engine, world;

var player, ground;
var play, howTo, returnMenu;
var groundSp, landScape;

var obstacleArr = [];
var monsterArr = [];
var potionArr = [];

var sword, swordlash;
var isAttacking = false;

var groundImg, landScapeImg, potionImg;
var playImg, howToImg, returnImg;
var playerImg, swordImg, monsterImg, spikesImg;
var customFont;

var gameState = "start";
var score = 0;
var bonus = 0;
var gameFrames = 0;
var gameSpeed = 5;
var stamina = 100, combo = 0, lastKillFrame = -999;
var nextObstacleFrame = 80, nextMonsterFrame = 600, nextPotionFrame = 900;
var HEAL = 6;
var clicked = false, clickX = 0, clickY = 0;
var bgOffset = 0, groundOffset = 0;
var swingUntil = 0;

function preload() {
  groundImg = loadImage("./images/ground.png");
  landScapeImg = loadImage("./images/gameLandscape.png");
  playImg = loadImage("./images/play.png");
  howToImg = loadImage("./images/howtoplay.png");
  returnImg = loadImage("./images/return.png");
  potionImg = loadImage("./images/potion.png");

  // FIX: load these once here, not inside constructors every spawn
  playerImg = loadImage("./images/sam.png");
  swordImg = loadImage("./images/flail.png");
  monsterImg = loadImage("./images/monster.png");
  spikesImg = loadImage("./images/spikes.png");

  customFont = loadFont("game_over.ttf");
}

function setup() {
  createCanvas(800, 400);
  noSmooth();   // keep pixel art crisp

  window.addEventListener("mousedown", function (e) {
    var cvs = document.getElementsByTagName("canvas")[0];
    if (!cvs) return;
    var r = cvs.getBoundingClientRect();
    clickX = (e.clientX - r.left) * (width / r.width);
    clickY = (e.clientY - r.top) * (height / r.height);
    clicked = true;
  });

  engine = Engine.create();
  world = engine.world;

  ground = new Ground(width / 2, 380, width * 2, 40);

  play = createSprite(width / 2, height / 2);
  play.addImage(playImg);
  play.scale = 0.6;
  play.visible = false;

  howTo = createSprite(width / 2, 300);
  howTo.addImage(howToImg);
  howTo.scale = 0.3;
  howTo.visible = false;

  returnMenu = createSprite(400, 315);
  returnMenu.addImage(returnImg);
  returnMenu.scale = 1;
  returnMenu.visible = false;

  gameState = "start";
}

// Helper: p5.play versions differ (remove vs destroy)
function killSprite(s) {
  if (!s) return;
  if (s.remove) s.remove();
  else if (s.destroy) s.destroy();
}

// FIX: old bodies/sprites were never removed on restart, they piled up in the world
function clearWorldObjects() {
  removeSword();

  for (let o of obstacleArr) World.remove(world, o.body);
  for (let m of monsterArr) World.remove(world, m.body);
  for (let p of potionArr) killSprite(p);
  if (player) World.remove(world, player.body);

  obstacleArr = [];
  monsterArr = [];
  potionArr = [];
}

function startGame() {
  clearWorldObjects();

  score = 0;
  bonus = 0;
  gameFrames = 0;
  gameSpeed = 5;

  player = new Player();

  stamina = 100;
  combo = 0;
  lastKillFrame = -999;
  nextObstacleFrame = 80;
  nextMonsterFrame = 600;
  nextPotionFrame = 900;

  // sword is now always equipped, hanging off the player like a flail
  sword = new Sword(player.body.position.x + 60, player.body.position.y);
  swordlash = new SwordLash(player.body, sword.body);
  isAttacking = true;

  bgOffset = 0;
  groundOffset = 0;

  play.visible = false;
  howTo.visible = false;
  returnMenu.visible = false;

  gameState = "play";
}

function draw() {
  drawFrame();
  clicked = false;   // a click only lasts one frame
}

function drawFrame() {
  background(255);
  drawBackground();

  Engine.update(engine);

  textFont(customFont);
  fill(255);

  if (gameState === "start") {


    play.visible = true;
    howTo.visible = true;

    drawSprites();

    if (clickedOn(play, playImg)) {
      startGame();
    }

    if (clickedOn(howTo, howToImg)) {
      gameState = "howto";
      play.visible = false;
      howTo.visible = false;
      returnMenu.visible = true;
    }

  } else if (gameState === "howto") {

    drawSprites();

    push();
    rectMode(CENTER);   // was inherited from ground.display() before
    fill(99, 23, 10);
    rect(400, 200, 500, 300);
    pop();

    // FIX: the panel was covering the return button, so draw it again on top
    returnMenu.display();

    fill(255);
    textSize(35);
    textLeading(42);
    text("CONTROLS:\nJump: Space\nDescend: Down arrow\nSwing sword: E", 170, 100);

    if (clickedOn(returnMenu, returnImg)) {
      gameState = "start";
      returnMenu.visible = false;
    }

  } else if (gameState === "play") {

    gameFrames++;
    score = Math.floor(gameFrames / 10) + bonus;

    // FIX: old difficulty scaling (score / 1000000) did basically nothing
    gameSpeed = Math.min(5 + score / 150, 12);
    bgOffset += 0.8;
    groundOffset += gameSpeed;

    player.jump();

    // Scroll background

    // Spawn obstacles: faster over time, sometimes in pairs
    if (gameFrames >= nextObstacleFrame) {
      obstacleArr.push(new Obstacle(0));
      if (random() < Math.min(0.15 + score / 1500, 0.5)) {
        obstacleArr.push(new Obstacle(75));
      }
      nextObstacleFrame = gameFrames + Math.max(40, Math.floor(random(55, 95) - score / 15));
    }

    // Spawn monsters: more often over time
    if (gameFrames >= nextMonsterFrame) {
      monsterArr.push(new Enemy());
      nextMonsterFrame = gameFrames + Math.max(240, 600 - score);
    }

    // Rare free potion (main healing now comes from killing monsters)
    if (gameFrames >= nextPotionFrame) {
      spawnPotion(width, height - random(90, 200));
      nextPotionFrame = gameFrames + 900;
    }

    // Sword swing (E): whips the sword forward, costs stamina
    stamina = Math.min(100, stamina + 0.6);
    if (keyWentDown("e") && stamina >= 35 && sword) {
      stamina -= 35;
      Body.setVelocity(sword.body, { x: 20, y: -10 });
      Body.setAngularVelocity(sword.body, 0.5);
      swingUntil = gameFrames + 30;   // only lethal during a swing
    }
    if (combo > 0 && gameFrames - lastKillFrame > 120) combo = 0;
    if (swordlash) swordlash.apply();

    // Obstacles
    for (let i = obstacleArr.length - 1; i >= 0; i--) {
      var o = obstacleArr[i];
      o.update(gameSpeed);

      if (swordLethal() && swordHits(o)) {
        registerKill(10);
        World.remove(world, o.body);
        obstacleArr.splice(i, 1);
      } else if (checkCollision(player, o)) {
        player.health -= 10;
        combo = 0;
        World.remove(world, o.body);
        obstacleArr.splice(i, 1);
      } else if (o.isOffScreen()) {
        World.remove(world, o.body);
        obstacleArr.splice(i, 1);
      }
    }

    // Monsters (they home in on you now)
    for (let i = monsterArr.length - 1; i >= 0; i--) {
      var m = monsterArr[i];
      m.update(player.body.position.y, gameSpeed);

      if (swordLethal() && swordHits(m)) {
        registerKill(50);
        if (random() < 0.5) {
          spawnPotion(m.body.position.x, constrain(m.body.position.y, 150, 310));
        }
        World.remove(world, m.body);
        monsterArr.splice(i, 1);
      } else if (checkCollision(player, m)) {
        player.health -= 15;
        combo = 0;
        World.remove(world, m.body);
        monsterArr.splice(i, 1);
      } else if (m.isOffScreen()) {
        World.remove(world, m.body);
        monsterArr.splice(i, 1);
      }
    }

    // Potions
    for (let i = potionArr.length - 1; i >= 0; i--) {
      var p = potionArr[i];
      p.velocityX = -gameSpeed;

      if (overlapsSprite(player, p)) {
        player.health = Math.min(player.health + HEAL, 100);
        killSprite(p);
        potionArr.splice(i, 1);
      } else if (p.position.x < -50) {
        killSprite(p);
        potionArr.splice(i, 1);
      }
    }

    // FIX draw order: background first, then everything else on top
    // (sword used to be drawn *under* the landscape sprite, so it was invisible)
    drawSprites();

    for (let o of obstacleArr) o.display();
    for (let m of monsterArr) m.display();

    if (isAttacking && sword) {
      swordlash.display();   // rope first, ball on top
      sword.display();
    }

    player.display();

    // UI
    fill("black");
    textFont(customFont);
    textSize(50);
    text("Health: " + Math.max(0, Math.round(player.health)), 40, 40);
    text("Score: " + score, 500, 40);

    push();
    rectMode(CORNER);
    stroke(0);
    fill(60);
    rect(40, 55, 150, 12);
    noStroke();
    fill(stamina >= 35 ? color(80, 200, 255) : color(200, 80, 80));
    rect(40, 55, 150 * stamina / 100, 12);
    pop();

    if (combo > 1) {
      textSize(40);
      text("COMBO x" + combo, 40, 100);
    }

    if (player.health <= 0) {
      removeSword();
      for (let p of potionArr) p.velocityX = 0;
      gameState = "end";
    }

  } else if (gameState === "end") {



    drawSprites();

    for (let o of obstacleArr) o.display();
    for (let m of monsterArr) m.display();
    if (player) player.display();

    // centered, and kept above the player so nothing overlaps
    push();
    fill("black");
    textAlign(CENTER);
    textSize(100);
    text("GAME OVER", width / 2, 140);

    textSize(35);
    text("Final Score: " + score, width / 2, 200);
    text("Press R to restart", width / 2, 245);
    pop();

    // FIX: there was no way to restart
    if (keyWentDown("r")) {
      startGame();
    }
  }
}


// Collision detection (AABB). Objects need .body, .width, .height
function checkCollision(player, obj) {
  if (!player || !obj || !player.body || !obj.body) {
    return false;
  }

  var p = player.body.position;
  var o = obj.body.position;

  var dx = Math.abs(p.x - o.x);
  var dy = Math.abs(p.y - o.y);

  var combinedWidth = (player.width + obj.width) / 2;
  var combinedHeight = (player.height + obj.height) / 2;

  return dx < combinedWidth && dy < combinedHeight;
}

// Player vs p5.play sprite (potion), fixed 40x40 hitbox
function overlapsSprite(player, s) {
  if (!player || !s) return false;

  var dx = Math.abs(player.body.position.x - s.position.x);
  var dy = Math.abs(player.body.position.y - s.position.y);

  return dx < (player.width + 40) / 2 && dy < (player.height + 40) / 2;
}

// Sword vs obstacle/monster
function swordHits(obj) {
  if (!sword || !sword.body || !obj || !obj.body) return false;
  return Bounds.overlaps(sword.body.bounds, obj.body.bounds);
}


// Remove sword and its constraint
function removeSword() {

  if (sword && sword.body) {
    World.remove(world, sword.body);
  }

  if (swordlash && swordlash.lash) {
    World.remove(world, swordlash.lash);
  }

  sword = undefined;
  swordlash = undefined;

  isAttacking = false;
}


// Sword only hurts things while it's moving fast (you have to actually swing it)
function swordLethal() {
  return sword && sword.body && gameFrames <= swingUntil;
}

function registerKill(base) {
  combo = Math.min(combo + 1, 5);
  lastKillFrame = gameFrames;
  bonus += base * combo;
}

function spawnPotion(x, y) {
  var potion = createSprite(x, y, 20, 20);
  potion.scale = 3;
  potion.addImage(potionImg);
  potionArr.push(potion);
}


// Seamless scrolling: every other tile is mirrored, so the edges always match
function drawLayer(img, offset, y) {
  var w = img.width;
  var first = Math.floor(offset / w);
  for (var i = first; i <= first + 1; i++) {
    var x = i * w - offset;
    push();
    if (i % 2 === 0) {
      image(img, x, y);
    } else {
      translate(x + w, y);
      scale(-1, 1);
      image(img, 0, 0);
    }
    pop();
  }
}

function drawBackground() {
  push();
  imageMode(CORNER);
  drawLayer(landScapeImg, bgOffset, 0);
  drawLayer(groundImg, groundOffset, 360);
  pop();
}


// Button click test in canvas coordinates (independent of p5.play + CSS scaling)
function clickedOn(spr, img) {
  if (!clicked || !spr.visible) return false;
  var w = img.width * spr.scale;
  var h = img.height * spr.scale;
  return Math.abs(clickX - spr.position.x) <= w / 2 &&
         Math.abs(clickY - spr.position.y) <= h / 2;
}