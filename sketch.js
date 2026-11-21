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

function preload() {
  groundImg = loadImage("./images/ground.png");
  landScapeImg = loadImage("./images/gameLandscape.png");
  playImg = loadImage("./images/play.png");
  howToImg = loadImage("./images/howtoplay.png");
  returnImg = loadImage("./images/return.png");
  potionImg = loadImage("./images/potion.png");

  playerImg = loadImage("./images/sam.png");
  swordImg = loadImage("./images/sword.png");
  monsterImg = loadImage("./images/monster.png");
  spikesImg = loadImage("./images/spikes.png");

  customFont = loadFont("game_over.ttf");
}

function setup() {
  createCanvas(800, 400);

  engine = Engine.create();
  world = engine.world;

  ground = new Ground(width / 2, 380, width * 2, 40);

  landScape = createSprite(width, height / 2, width * 2, 40);
  landScape.addImage(landScapeImg);
  landScape.velocityX = 0;

  groundSp = createSprite(width, 380, width * 2, 40);
  groundSp.addImage(groundImg);
  groundSp.velocityX = 0;

  play = createSprite(width / 2, height / 2);
  play.addImage(playImg);
  play.scale = 0.6;
  play.visible = false;

  howTo = createSprite(width / 2, 300);
  howTo.addImage(howToImg);
  howTo.scale = 0.3;
  howTo.visible = false;

  returnMenu = createSprite(500, 300);
  returnMenu.addImage(returnImg);
  returnMenu.scale = 0.6;
  returnMenu.visible = false;

  gameState = "start";
}


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

  landScape.x = width;
  groundSp.x = width;
  landScape.velocityX = -0.8;
  groundSp.velocityX = -gameSpeed;

  play.visible = false;
  howTo.visible = false;
  returnMenu.visible = false;

  gameState = "play";
}

function draw() {
  background(255);

  Engine.update(engine);

  textFont(customFont);
  fill(255);

  if (gameState === "start") {
    ground.display();

    landScape.velocityX = 0;
    groundSp.velocityX = 0;

    play.visible = true;
    howTo.visible = true;

    drawSprites();

    if (mousePressedOver(play)) {
      startGame();
    }

    if (mousePressedOver(howTo)) {
      gameState = "howto";
      play.visible = false;
      howTo.visible = false;
      returnMenu.visible = true;
    }

  } else if (gameState === "howto") {

    ground.display();
    drawSprites();

    push();
    fill(99, 23, 10);
    rect(400, 200, 500, 300);
    pop();

    // FIX: the panel was covering the return button, so draw it again on top
    returnMenu.display();

    fill(255);
    textSize(35);
    text("CONTROLS:\nJump: Space\nDescend: Down arrow\nAttack: Hold E", 170, 100);

    if (mousePressedOver(returnMenu)) {
      gameState = "start";
      returnMenu.visible = false;
    }

  } else if (gameState === "play") {

    gameFrames++;
    score = Math.floor(gameFrames / 10) + bonus;

    // FIX: old difficulty scaling (score / 1000000) did basically nothing
    gameSpeed = Math.min(5 + score / 150, 12);
    groundSp.velocityX = -gameSpeed;

    player.jump();
    ground.display();

    // Scroll background
    if (groundSp.x <= 0) groundSp.x = width;
    if (landScape.x <= 0) landScape.x = width;

    // Spawn obstacles
    if (gameFrames % 80 === 0) {
      obstacleArr.push(new Obstacle());
    }

    // Spawn monsters
    if (gameFrames % 800 === 0) {
      monsterArr.push(new Enemy());
    }

    // Spawn potions
    if (gameFrames % 200 === 0) {
      var potion = createSprite(width, height - random(90, 200), 20, 20);
      potion.scale = 3;
      potion.addImage(potionImg);
      potionArr.push(potion);
    }

    // Sword attack (hold E)
    if (keyWentDown("e") && !isAttacking) {
      isAttacking = true;
      sword = new Sword(player.body.position.x + 50, player.body.position.y);
      swordlash = new SwordLash(player.body, sword.body);
    }

    if (keyWentUp("e") && isAttacking) {
      removeSword();
    }

    // Obstacles: update once per frame (was being updated/drawn twice)
    for (let i = obstacleArr.length - 1; i >= 0; i--) {
      var o = obstacleArr[i];
      o.update(gameSpeed);

      if (isAttacking && swordHits(o)) {
        bonus += 10;
        World.remove(world, o.body);
        obstacleArr.splice(i, 1);
      } else if (checkCollision(player, o)) {
        player.health -= 10;
        World.remove(world, o.body);
        obstacleArr.splice(i, 1);
      } else if (o.isOffScreen()) {
        // FIX: off-screen obstacles were never removed
        World.remove(world, o.body);
        obstacleArr.splice(i, 1);
      }
    }

    // Monsters
    for (let i = monsterArr.length - 1; i >= 0; i--) {
      var m = monsterArr[i];
      m.update();

      if (isAttacking && swordHits(m)) {
        bonus += 50;
        World.remove(world, m.body);
        monsterArr.splice(i, 1);
      } else if (checkCollision(player, m)) {
        player.health -= 10;
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

      // FIX: potions are p5.play sprites with no .body, so checkCollision always failed
      if (overlapsSprite(player, p)) {
        player.health = Math.min(player.health + 10, 100);
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
      sword.display();
      swordlash.display();
    }

    player.display();

    // UI
    fill("black");
    textFont(customFont);
    textSize(50);
    text("Health: " + Math.max(0, Math.round(player.health)), 40, 40);
    text("Score: " + score, 500, 40);

    if (player.health <= 0) {
      removeSword();
      for (let p of potionArr) p.velocityX = 0;
      gameState = "end";
    }

  } else if (gameState === "end") {

    ground.display();

    groundSp.velocityX = 0;
    landScape.velocityX = 0;

    drawSprites();

    for (let o of obstacleArr) o.display();
    for (let m of monsterArr) m.display();
    if (player) player.display();

    fill("black");
    textSize(100);
    text("GAME OVER", 180, 200);

    textSize(35);
    text("Final Score: " + score, 300, 260);
    text("Press R to restart", 300, 300);

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


function swordHits(obj) {
  if (!sword || !sword.body || !obj || !obj.body) return false;
  return Bounds.overlaps(sword.body.bounds, obj.body.bounds);
}



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