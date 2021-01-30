const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Constraint = Matter.Constraint;

var engine, world;
var player, ground, potion, sword, swordlash, obstacle, monster, groundSp, landScape;
var play, howTo, score, returnMenu;
var obstacleArr, monsterArr;
var groundImg, landScapeImg, potionImg, playImg, howToImg;
var gameState;

function preload() {
  groundImg = loadImage('./images/ground.png');
  landScapeImg = loadImage('./images/gameLandscape.png');
  playImg = loadImage('./images/play.png');
  howToImg = loadImage('./images/howtoplay.png');
  returnImg = loadImage('./images/return.png');
  potionImg = loadImage('./images/potion.png')

  customFont = loadFont('game_over.ttf');
}

function setup() {
  createCanvas(800, 400);

  engine = Engine.create();
  world = engine.world;

  player = new Player();
  ground = new Ground(width / 2, 380, width * 2, 40);


  landScape = createSprite(width, height / 2, width * 2, 40);
  landScape.addImage(landScapeImg);
  landScape.velocityX = -0.8


  groundSp = createSprite(width, 380, width * 2, 40);
  groundSp.addImage(groundImg);
  groundSp.velocityX = -5;

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

  obstacleArr = [];
  monsterArr = [];

  gameState = 'start';

  score = 0;

}

function draw() {
  background(255, 255, 255);
  Engine.update(engine);

  textFont(customFont);
  fill(255);
  textSize(40);


  if (gameState === 'start') {

    ground.display();
    drawSprites();

    groundSp.velocityX = 0;
    landScape.velocityX = 0;

    play.visible = true;
    howTo.visible = true;

    if (mousePressedOver(play)) {
      gameState = 'play';

      landScape.velocityX = -0.8;
      groundSp.velocityX = -5;

      play.visible = false;
      howTo.visible = false;

    }

    if (mousePressedOver(howTo)) {
      gameState = 'howto';

      play.visible = false;
      howTo.visible = false;

      returnMenu.visible = true;
    }

  } else if (gameState === 'howto') {

    ground.display();
    drawSprites();

    push()
    fill(99, 23, 10);
    rect(400, 200, 500, 300);
    pop()

    text(`CONTROLS:\nJump: Space\nDescend: Down arrow\nAttack: E`, 170, 100);
    
    if (mousePressedOver(returnMenu)) {
      gameState = 'start';
    }

  } else if (gameState === 'play') {

    player.jump();

    ground.display();

    score = Math.round(score + frameCount/10);
    
     

    if (groundSp.x <= 0) {
      groundSp.x = width;
    }

    if (landScape.x <= 0) {
      landScape.x = width;
    }

    drawSprites();

    if (frameCount % 80 === 0) {
      obstacle = new Obstacle();
      obstacleArr.push(obstacle);
      obstacle.velocityX = obstacle.velocityX - score / 1000000;
      groundSp.velocityX = groundSp.velocityX - score / 10000000;

      console.log(groundSp.velocityX);
      console.log(obstacle.velocityX);
    }

    if (frameCount % 800 === 0) {
      monster = new Enemy();
      monsterArr.push(monster);
    }

    if (frameCount % 200 === 0) {
      potion = createSprite(width, height - random(90, 200), 20, 20);
      potion.velocityX = -5;
      potion.scale = 3;
      potion.addImage(potionImg);
    }


    if (obstacle != undefined) {
      for (let i = 0; i < obstacleArr.length; i++) {
        var o = obstacleArr[i];
        console.log(o);
        if (o != undefined) {
          o.display();
          collide(player, o, i);
        }
      }
    }

    if (monster != undefined) {
      for (let i = 0; i < monsterArr.length; i++) {
        var m = monsterArr[i];
        if (m != undefined) {
          m.display();
          collide(player, m, i);
        }
      }
    }

    if (potion != undefined) {
      collect(player, potion);
    }


    fill("black");
    textFont(customFont);
    textSize(50)
    text("Health: " + Math.round(player.health), 40, 40);
    text('score: ' + score, 500, 40);


    player.display();

    var a = 0;

    if (keyWentDown("e") && a === 0) {
      sword = new Sword();
      swordlash = new SwordLash(player.body, sword.body);
      sword.display();
      swordlash.display();
      a++;

    }

    if (keyWentUp("e") && a === 1) {
      removeSword();
    }

    if (player.health <= 0) {
      gameState = 'end';
    }

  } else {

    ground.display();
    drawSprites();


    groundSp.velocityX = 0;
    landScape.velocityX = 0;

    textSize(200);
    text('GAME OVER', 180, 200);

  }



}


function removeSword() {
  World.remove(world, sword.body);
  World.remove(world, swordlash.lash);


  a = 0;
}

function collide(player, obs, i) {

  if (player.body.position.x - obs.body.position.x <= ((obs.width) + 5) / 2 + ((player.width) + 5) / 2
    && obs.body.position.x - player.body.position.x <= ((obs.width) + 5) / 2 + ((player.width) + 5) / 2
    && player.body.position.y - obs.body.position.y <= ((obs.height) + 5) / 2 + ((player.height) + 5) / 2
    && obs.body.position.y - player.body.position.y <= ((obs.height) + 5) / 2 + ((player.height) + 5) / 2) {

    player.health -= 10;
    World.remove(world, obs.body);
    delete obstacleArr[i]
  }

}

function collect(player, pot) {

  if (player.body.position.x - pot.x <= ((pot.width) + 5) / 2 + ((player.width) + 5) / 2
    && pot.x - player.body.position.x <= ((pot.width) + 5) / 2 + ((player.width) + 5) / 2
    && player.body.position.y - pot.y <= ((pot.height) + 5) / 2 + ((player.height) + 5) / 2
    && pot.y - player.body.position.y <= ((pot.height) + 5) / 2 + ((player.height) + 5) / 2) {

    player.health += 0.1;

    potion.destroy();
  }

}



