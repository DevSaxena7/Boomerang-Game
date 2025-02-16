
let axe, char, enemy, game_over, back_ground, enemyArmored, lava, space, enemyWinged;

// Class to cover the different types of enemies throughout the levels
class Enemy {
  // constructs the speed, health, damage, and position (random) based on enemy type
  constructor(type) {
    this.type = type;
    this.x = Math.random();
    this.y = Math.random();
    if(type == "normal") {
      this.speed = 0.004;
      this.health = 0.000001;
      this.dmg = 0.005;
    } else if(type == "heavy") {
      this.speed = 0.002;
      this.health = 1;
      this.dmg = 0.005;
    } else if(type == "light") {
      this.speed = 0.006;
      this.health = 0.000001;
      this.dmg = 0.002;
    }
  }

  // function that draws the images for each enemy
  drawEnemy() {
    if(this.type == "normal") {
      return drawImg(enemy, 0, 0);
    } else if(this.type == "heavy") {
      return drawImg(enemyArmored, 0, 0);
    } else if(this.type == "light") {
      return drawImg(enemyWinged, 0, 0);
    }
  }
}

// constants variables (like the window size and different game mechanic thresholds)
let cW, cH;
let myFont;
const powerUpDuration = 5;
const soulThreshold = 30;
const levelDuration = 30;
let timer = 0;

// variables for the player features
let charX = 0.5;
let charY = 0.5;
let health = 1;
let souls = 0;
let totalSouls = 0;
let activated = false;
let timeLeft = 0;
let kills = 0;

// variables for the axe
let attached = true;
let projX, projY;
let projV = 0;
let projR = 0;

// instantiates all the enemies
let enemies = [new Enemy("normal"), new Enemy("normal")];
enemies[0].x = 0.25;
enemies[0].y = 0.25;
enemies[1].x = 0.75;
enemies[1].y = 0.75;
let dying = false;

// all of the below is preloading images or sounds
let boom, whoosh, wasted;

let stage = 0;


function preload() {
  axe = loadImage("images/axedrawing.png");
  char_rest = loadImage("images/characterdrawing_rest.png");
  char_attack = loadImage("images/characterdrawing_attack.png");
  enemy = loadImage("images/zombiedrawing.png");
  enemyArmored = loadImage("images/zombiearmordrawing.png");
  game_over = loadImage("images/gameoverdrawing.png");
  back_ground = loadImage("images/backgrounddrawing.png");
  lava = loadImage("images/lavaBackground.png");
  space = loadImage("images/spacebackground.png");
  enemyWinged = loadImage("images/zombiewings.png");

  boom = loadSound("sounds/Cinematic Boom 2.mp3");
  whoosh = loadSound("sounds/Deep whoosh.mp3");
  wasted = loadSound("sounds/Wasted.mp3");

  myFont = loadFont("pixelated.ttf");
}

function setup() {
  cW = windowWidth;
  cH = windowHeight;
  createCanvas(cW, cH);

  axe.resize(cW * 0.04, 0);
  char_attack.resize(cW * 0.05, 0);
  char_rest.resize(cW * 0.05, 0);
  enemy.resize(cW * 0.05, 0);
  game_over.resize(cW * 0.3, 0);
  enemyWinged.resize(cW*0.08, 0);

  angleMode(DEGREES);
  textFont(myFont);
  textSize(70);
}

function draw() {
  console.log(stage);
  // stages (in order from 0 to 6): Level 1 prescreen, level 1, level 2 prescreen, level 2, game over, level 3 prescreen, level 3
  if (stage == 4) {
    background(space);
    drawImg(game_over, 0.5, 0.5);
    textAlign(CENTER, CENTER);
    fill("white");
    text("Total kills: "+totalSouls, 0.5*cW, 0.8*cH);
  } else if (stage == 1) {
    clear();
    background(back_ground);

    // timer
    fill("white");
    text((levelDuration - Math.floor(timer)), 0.85 * cW, 0.9 * cH);

    // health and power boxes
    fill("white");
    drawRect(0.7, 0.1, 0.2, 0.05);
    drawRect(0.1, 0.1, 0.2, 0.05);

    // determines if player is in power up
    if (souls >= soulThreshold) {
      souls = 0;
      activated = true;
      timeLeft = 0.2;
      boom.play();
      setTimeout(function() {
        activated = false;
        timeLeft = 0;
      }, powerUpDuration * 1000);
    }

    // determines if the player died
    if (health <= 0) {
      setTimeout(function() {
        wasted.play();
      }, 500);
      health = 0;
      stage = 4;
    }

    // determines if player is losing health
    if (health < 0.2 || dying) {
      fill("red");
    } else {
      fill("green");
    }
    drawRect(0.7, 0.1, 0.2 * health, 0.05);

    // Draws power bar
    fill("#00008B");
    if (!activated) {
      drawRect(0.1, 0.1, souls / (soulThreshold / 0.2), 0.05);
    } else {
      drawRect(0.1, 0.1, timeLeft, 0.05);
    }

    // draws character and points axe in the right direction
    let aim = createVector(mouseX - (charX * cW), mouseY - (charY * cH));
    push();
    translate(charX * cW, charY * cH);
    rotate(aim.heading() - 90);
    if (activated) {
      drawImg(char_attack, 0, 0);
    } else {
      drawImg(char_rest, 0, 0);
    }
    pop();

    // determines where axe is/updates position
    if (attached) {
      aim.setMag(0.06 * cW);
      projX = charX + (aim.x / cW);
      projY = charY + (aim.y / cH);
    } else {
      let velocity = createVector(projX - charX, projY - charY);
      velocity.mult(projV);
      projX = projX + velocity.x;
      projY = projY + velocity.y;
      projV -= 0.001;
      projR += 20;
    }

    // connects axe to player when close enough
    if (intersects(projX * cW, projY * cH, 0.04 * cW, charX * cW, charY * cH, 0.05 * cW) && projV < 0) {
      attached = true;
      projR = 0;
    }

    // draws axe
    push();
    translate((projX * cW), (projY * cH));
    rotate(projR);
    drawImg(axe, 0, 0);
    pop();

    // moves the character in direction corresponding to arrow keys
    let charSpeed = activated ? 0.01 : 0.005;
    if (keyIsDown(87) && charY > 0.04) {
      charY -= charSpeed;
    }
    if (keyIsDown(83) && charY < 0.96) {
      charY += charSpeed;
    }
    if (keyIsDown(65) && charX > 0.02) {
      charX -= charSpeed;
    }
    if (keyIsDown(68) && charX < 0.98) {
      charX += charSpeed;
    }

    // updates enemies and determines if player is dying
    dying = false;
    for (let i = 0; i < enemies.length; i++) {
      let scalar;
      if (activated) {
        scalar = -0.2;
      } else {
        scalar = 1;
      }
      
      // updates enemy position
      let attack = createVector(charX - enemies[i].x, charY - enemies[i].y);
      attack.setMag(enemies[i].speed * scalar);
      push();
      translate(enemies[i].x * cW, enemies[i].y * cH);
      rotate(attack.heading() - 90);
      drawImg(enemy, 0, 0);
      pop();
      enemies[i].x += attack.x;
      enemies[i].y += attack.y;
      enemies[i].x = Math.max(0.02, enemies[i].x);
      enemies[i].x = Math.min(0.98, enemies[i].x);
      enemies[i].y = Math.max(0.04, enemies[i].y);
      enemies[i].y = Math.min(0.96, enemies[i].y);

      // determines intersection between enemy and character
      if (intersects(enemies[i].x * cW, enemies[i].y * cH, 0.03 * cW, charX * cW, charY * cH, 0.03 * cW)) {
        if (activated) {
          // kills the enemy
          enemies[i] = new Enemy(enemies[i].type);
          while (distance(charX, charY, enemies[i].x, enemies[i].y) < 0.3) {
            enemies[i] = new Enemy(enemies[i].type);
          }
          souls++;
          totalSouls++;
        } else if (!dying) {
          // takes away health
          health -= enemies[i].dmg;
          dying = true;
        }
      }
      enemies[i].speed += 0.000005;
    }

    // kills enemies by axe
    if (!attached) {
      for (let i = 0; i < enemies.length; i++) {
        if (intersects(enemies[i].x * cW, enemies[i].y * cH, 0.05 * cW, projX * cW, projY * cH, 0.03 * cW)) {
          enemies[i] = new Enemy(enemies[i].type);
          while (distance(charX, charY, enemies[i].x, enemies[i].y) < 0.3) {
            enemies[i] = new Enemy(enemies[i].type);
          }
          souls++;
          totalSouls++;
        }
      }
    }

    // checks if level passed
    if (timer >= levelDuration) {
      stage = 2;
      timer = 0;
    }

    timer += 1 / 60;
  } else if (stage == 0) {
    background(back_ground);
    push();
    textAlign(CENTER, CENTER);
    textSize(40);
    fill("white");
    text("Survive   for  as  long  as  possible!", 0.5 * cW, 0.2 * cH);
    text("Use WASD to move,\nand click to throw\nyour axe in a\ncertain direction", 0.5 * cW, 0.5 * cH);
    text("The green bar is\nyour health, which\ngoes down as you\ntouch a zombie", 0.2 * cW, 0.5 * cH);
    text("The purple bar is\nyour kills, which builds\nup until you can start\nkilling zombies\nby running into them", 0.8 * cW, 0.5 * cH);
    text("Click the spacebar to start!\nPress escape to leave at any time!", 0.5 * cW, 0.8 * cH);
    pop();
    if (keyIsDown(32)) {
      stage = 1;
    }
  } else if (stage == 2) {
    background(lava);
    push();
    textAlign(CENTER, CENTER);
    textSize(40);
    fill("white");
    text("Congratulations!\nYou passed the first level", cW * 0.5, cH * 0.3);
    text("The next level won't be so easy though\nPress space to continue", cW * 0.5, cH * 0.7);
    pop();
    if (keyIsDown(32)) {
      stage = 3;
      charX = 0.5;
      charY = 0.5;
      health = 1;
      enemies = [new Enemy("heavy"), new Enemy("heavy")];
      enemies[0].x = 0.25;
      enemies[0].y = 0.25;
      enemies[1].x = 0.75;
      enemies[1].y = 0.75;
    }
  } else if (stage == 3) {
    clear();
    background(lava);

    fill("white");
    text((levelDuration - Math.floor(timer)), 0.85 * cW, 0.9 * cH);

    fill("white");
    drawRect(0.7, 0.1, 0.2, 0.05);
    drawRect(0.1, 0.1, 0.2, 0.05);

    if (souls >= soulThreshold) {
      souls = 0;
      activated = true;
      timeLeft = 0.2;
      boom.play();
      setTimeout(function() {
        activated = false;
        timeLeft = 0;
      }, powerUpDuration * 1000);
    }

    if (health <= 0) {
      setTimeout(function() {
        wasted.play();
      }, 500);
      health = 0;
      stage = 4;
    }

    if (health < 0.2 || dying) {
      fill("red");
    } else {
      fill("green");
    }
    drawRect(0.7, 0.1, 0.2 * health, 0.05);

    fill("#00008B");
    if (!activated) {
      drawRect(0.1, 0.1, souls / (soulThreshold / 0.2), 0.05);
    } else {
      drawRect(0.1, 0.1, timeLeft, 0.05);
    }

    let aim = createVector(mouseX - (charX * cW), mouseY - (charY * cH));
    push();
    translate(charX * cW, charY * cH);
    rotate(aim.heading() - 90);
    if (activated) {
      drawImg(char_attack, 0, 0);
    } else {
      drawImg(char_rest, 0, 0);
    }
    pop();

    if (attached) {
      aim.setMag(0.06 * cW);
      projX = charX + (aim.x / cW);
      projY = charY + (aim.y / cH);
    } else {
      let velocity = createVector(projX - charX, projY - charY);
      velocity.mult(projV);
      projX = projX + velocity.x;
      projY = projY + velocity.y;
      projV -= 0.001;
      projR += 20;
    }

    if (intersects(projX * cW, projY * cH, 0.04 * cW, charX * cW, charY * cH, 0.05 * cW) && projV < 0) {
      attached = true;
      projR = 0;
    }

    push();
    translate((projX * cW), (projY * cH));
    rotate(projR);
    drawImg(axe, 0, 0);
    pop();

    let charSpeed = activated ? 0.01 : 0.005;
    if (keyIsDown(87) && charY > 0.04) {
      charY -= charSpeed;
    }
    if (keyIsDown(83) && charY < 0.96) {
      charY += charSpeed;
    }
    if (keyIsDown(65) && charX > 0.02) {
      charX -= charSpeed;
    }
    if (keyIsDown(68) && charX < 0.98) {
      charX += charSpeed;
    }

    dying = false;
    for (let i = 0; i < enemies.length; i++) {
      let scalar;
      if (activated) {
        scalar = -0.2;
      } else {
        scalar = 1;
      }
      let attack = createVector(charX - enemies[i].x, charY - enemies[i].y);
      attack.setMag(enemies[i].speed * scalar);
      push();
      translate(enemies[i].x * cW, enemies[i].y * cH);
      rotate(attack.heading() - 90);
      drawImg(enemyArmored, 0, 0);
      pop();
      enemies[i].x += attack.x;
      enemies[i].y += attack.y;
      enemies[i].x = Math.max(0.02, enemies[i].x);
      enemies[i].x = Math.min(0.98, enemies[i].x);
      enemies[i].y = Math.max(0.04, enemies[i].y);
      enemies[i].y = Math.min(0.96, enemies[i].y);

      if (intersects(enemies[i].x * cW, enemies[i].y * cH, 0.03 * cW, charX * cW, charY * cH, 0.03 * cW)) {
        if (activated) {
          enemies[i].health -= 50;
          if (enemies[i].health <= 0) {
            enemies[i] = new Enemy(enemies[i].type);
            while (distance(charX, charY, enemies[i].x, enemies[i].y) < 0.3) {
              enemies[i] = new Enemy(enemies[i].type);
            }
            souls++;
            totalSouls++;
          }
        } else if (!dying) {
          health -= enemies[i].dmg;
          dying = true;
        }
      }
      if (!attached) {
        for (let i = 0; i < enemies.length; i++) {
          if (intersects(enemies[i].x * cW, enemies[i].y * cH, 0.05 * cW, projX * cW, projY * cH, 0.03 * cW)) {
            
            enemies[i].health -= 0.02;
            if (enemies[i].health <= 0) {
              enemies[i] = new Enemy(enemies[i].type);
              while (distance(charX, charY, enemies[i].x, enemies[i].y) < 0.3) {
                enemies[i] = new Enemy(enemies[i].type);
              }
              souls++;
              totalSouls++;
            }
          }
        }
      }
      enemies[i].speed += 0.000005;
    }

    if (timer >= levelDuration) {
      stage = 5;
      timer = 0;
    }

    timer += 1 / 60;
  } else if(stage == 5) {
    background(space);
    push();
    textAlign(CENTER, CENTER);
    textSize(40);
    fill("white");
    text("Congratulations!\nYou passed the second level", cW * 0.5, cH * 0.3);
    text("The final level will use everything you have so far and more\nPress space to continue", cW * 0.5, cH * 0.7);
    pop();
    if (keyIsDown(32)) {
      stage = 6;
      charX = 0.5;
      charY = 0.5;
      health = 1;
      enemies = [new Enemy(chooseEnemyType()), new Enemy(chooseEnemyType()), new Enemy(chooseEnemyType())];
    }
  } else if(stage == 6) {
    clear();
    background(space);


    fill("white");
    drawRect(0.7, 0.1, 0.2, 0.05);
    drawRect(0.1, 0.1, 0.2, 0.05);

    if (souls >= soulThreshold) {
      souls = 0;
      activated = true;
      timeLeft = 0.2;
      boom.play();
      setTimeout(function() {
        activated = false;
        timeLeft = 0;
      }, powerUpDuration * 1000);
    }

    if (health <= 0) {
      setTimeout(function() {
        wasted.play();
      }, 500);
      health = 0;
      stage = 4;
    }

    if (health < 0.2 || dying) {
      fill("red");
    } else {
      fill("green");
    }
    drawRect(0.7, 0.1, 0.2 * health, 0.05);

    fill("#00008B");
    if (!activated) {
      drawRect(0.1, 0.1, souls / (soulThreshold / 0.2), 0.05);
    } else {
      drawRect(0.1, 0.1, timeLeft, 0.05);
    }

    let aim = createVector(mouseX - (charX * cW), mouseY - (charY * cH));
    push();
    translate(charX * cW, charY * cH);
    rotate(aim.heading() - 90);
    if (activated) {
      drawImg(char_attack, 0, 0);
    } else {
      drawImg(char_rest, 0, 0);
    }
    pop();

    if (attached) {
      aim.setMag(0.06 * cW);
      projX = charX + (aim.x / cW);
      projY = charY + (aim.y / cH);
    } else {
      let velocity = createVector(projX - charX, projY - charY);
      velocity.mult(projV);
      projX = projX + velocity.x;
      projY = projY + velocity.y;
      projV -= 0.001;
      projR += 20;
    }

    if (intersects(projX * cW, projY * cH, 0.04 * cW, charX * cW, charY * cH, 0.05 * cW) && projV < 0) {
      attached = true;
      projR = 0;
    }

    push();
    translate((projX * cW), (projY * cH));
    rotate(projR);
    drawImg(axe, 0, 0);
    pop();

    let charSpeed = activated ? 0.01 : 0.005;
    if (keyIsDown(87) && charY > 0.04) {
      charY -= charSpeed;
    }
    if (keyIsDown(83) && charY < 0.96) {
      charY += charSpeed;
    }
    if (keyIsDown(65) && charX > 0.02) {
      charX -= charSpeed;
    }
    if (keyIsDown(68) && charX < 0.98) {
      charX += charSpeed;
    }

    dying = false;
    for (let i = 0; i < enemies.length; i++) {
      let scalar;
      if (activated) {
        scalar = -0.2;
      } else {
        scalar = 1;
      }
      let attack = createVector(charX - enemies[i].x, charY - enemies[i].y);
      attack.setMag(enemies[i].speed * scalar);
      push();
      translate(enemies[i].x * cW, enemies[i].y * cH);
      rotate(attack.heading() - 90);
      enemies[i].drawEnemy();
      pop();
      enemies[i].x += attack.x;
      enemies[i].y += attack.y;
      enemies[i].x = Math.max(0.02, enemies[i].x);
      enemies[i].x = Math.min(0.98, enemies[i].x);
      enemies[i].y = Math.max(0.04, enemies[i].y);
      enemies[i].y = Math.min(0.96, enemies[i].y);

      if (intersects(enemies[i].x * cW, enemies[i].y * cH, 0.03 * cW, charX * cW, charY * cH, 0.03 * cW)) {
        if (activated) {
          enemies[i].health -= 50;
          if (enemies[i].health <= 0) {
            enemies[i] = new Enemy(chooseEnemyType());
            while (distance(charX, charY, enemies[i].x, enemies[i].y) < 0.3) {
              enemies[i] = new Enemy(chooseEnemyType());
            }
            souls++;
            totalSouls++;
          }
        } else if (!dying) {
          health -= enemies[i].dmg;
          dying = true;
        }
      }
      if (!attached) {
        for (let i = 0; i < enemies.length; i++) {
          if (intersects(enemies[i].x * cW, enemies[i].y * cH, 0.05 * cW, projX * cW, projY * cH, 0.03 * cW)) {

            enemies[i].health -= 0.02;
            if (enemies[i].health <= 0) {
              enemies[i] = new Enemy(chooseEnemyType());
              while (distance(charX, charY, enemies[i].x, enemies[i].y) < 0.3) {
                enemies[i] = new Enemy(chooseEnemyType());
              }
              souls++;
              totalSouls++;
            }
          }
        }
      }
      enemies[i].speed += 0.000005;
    }
  }

  if (keyIsDown(27)) {
    stage = 4;
  }

  if (activated) {
    timeLeft -= (0.2 / (frameRate() * powerUpDuration));
  }
}

function mousePressed() {
  if (attached) {
    whoosh.play();
    attached = false;
    projV = 0.06;
  }
}

function drawEllipse(x, y, r1) {
  return ellipse(x * cW, y * cH, r1 * cW, r1 * cW);
}

function drawImg(img, x, y) {
  return image(img, (x * cW) - (img.width / 2), (y * cH) - (img.height / 2));
}

function intersects(x1, y1, r1, x2, y2, r2) {
  return (distance(x1, y1, x2, y2) < (r1 + r2));
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2));
}

function drawRect(x, y, w, h) {
  return rect(x * cW, y * cH, w * cW, h * cH);
}

function chooseEnemyType() {
  let rand = Math.random();
  if(rand < 0.33) {
    return "normal";
  } else if(rand < 0.66) {
    return "heavy";
  } else {
    return "light";
  }
}