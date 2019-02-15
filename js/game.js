const elem = document.getElementById('stage');
let maxSpeed = 6;
let decelerationTime = 6;
// [round(log(x,2) * 6) for x in range(2, 11)]
// [6, 10, 12, 14, 16, 17, 18, 19, 20];
function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}
const accelerationTime = [];
for (let i = 2; i < maxSpeed + 1; i++) {
  accelerationTime.push(Math.round(getBaseLog(2, i) * 6));
}
const brakeTime = 3;
// width and height of each grid box
const gridSize = 16;

// number of points
const stageWidth = 32 * gridSize; // x limit
const stageHeight = 32 * gridSize; // y limit

const two = new Two({
  width: stageWidth,
  height: stageHeight
}).appendTo(elem);

const stage = two.makeRectangle(
  stageWidth / 2,
  stageHeight / 2,
  stageWidth,
  stageHeight
);
stage.fill = '#2c3e50';
stage.stroke = '#ecf0f1';
stage.linewidth = 1;

// create grid
for (let x = 0; x <= stageWidth; x += gridSize) {
  two.makeLine(x, 0, x, stageHeight).stroke = '#fff';
}
for (let y = 0; y <= stageHeight; y += gridSize) {
  two.makeLine(0, y, stageWidth, y).stroke = '#fff';
}

function getOffsets(direction, baseAmount) {
  let offsetX = 0;
  let offsetY = 0;
  switch (direction) {
    case 'up':
      offsetY = -baseAmount;
      break;
    case 'down':
      offsetY = baseAmount;
      break;
    case 'left':
      offsetX = -baseAmount;
      break;
    case 'right':
      offsetX = baseAmount;
      break;
  }
  return { offsetX, offsetY };
}

// create players
const playerSize = 6;
const hitboxSize = 5;
const hitboxOffset = 3;

function createPlayerCircle(x, y, color, trimColor, direction) {
  const circle = two.makeCircle(x, y, playerSize);
  circle.stroke = color;
  circle.fill = trimColor;
  circle.linewidth = 2;
  const { offsetX, offsetY } = getOffsets(direction, hitboxOffset);
  const hitbox = two.makeRectangle(
    x + offsetX,
    y + offsetY,
    hitboxSize,
    hitboxSize
  );
  hitbox.noFill();
  hitbox.noStroke();
  const group = two.makeGroup(circle, hitbox);
  group.center();
  group.translation.set(x, y);
  return group;
}

function createHUD(el, name, wins, speed) {
  document.getElementById(el).innerHTML = `
    <div class="hud">
      <h3>${name}</h3>
      <p><small>WINS</small></p>
      <h3>${wins}</h3>
      <p><small>SPEED</small></p>
      <h3 id="${name}-speed">${speed}</h3>
    </div>`;
}

function initPlayer(
  name,
  x,
  y,
  defaultDirection,
  wins,
  color,
  trimColor,
  HUDelement
) {
  createHUD(HUDelement, name, wins, 1);
  return {
    name: name,
    prevDirection: defaultDirection,
    direction: defaultDirection,
    lastMoveFrame: 0,
    _speed: 1,
    get speed() {
      return this._speed;
    },
    set speed(spd) {
      document.getElementById(`${name}-speed`).innerText = spd;
      this._speed = spd;
    },
    isAccelerating: false,
    isBraking: false,
    lastDecelerateFrame: 0,
    lastAccelerateFrame: 0,
    lastBrakeFrame: 0,
    alive: true,
    wins: wins,
    group: createPlayerCircle(x, y, color, trimColor, defaultDirection),
    color: color,
    trimColor: trimColor,
    currentOrigin: new Two.Vector(x, y),
    lightTrails: [],
    corpse: null,
    sound: new Audio(),
    soundPromise: null
  };
}

function initUser(wins) {
  return initPlayer(
    'P1',
    Math.round(stageWidth / 2),
    gridSize * 8,
    'down',
    wins,
    '#3498db',
    '#ffffff',
    'userHud'
  );
}

let user = initUser(0);

function initEnemy(wins) {
  return initPlayer(
    'P2',
    Math.round(stageWidth / 2),
    stageHeight - gridSize * 8,
    'up',
    wins,
    '#e67e22',
    '#000000',
    'enemyHud'
  );
}

let enemy = initEnemy(0);

let players = [user, enemy];

two.update();

function checkCollision(player) {
  const trn = player.group.translation;
  if (
    trn.x >= stageWidth - hitboxSize || // right limit
    trn.x <= 0 + hitboxSize || // left limit
    trn.y >= stageHeight - hitboxSize || // down limit
    trn.y <= 0 + hitboxSize // up limit
  ) {
    return true;
  }

  const hitboxRect = player.group._collection[1].getBoundingClientRect();
  // Use for-loops instead for better performance
  // https://github.com/dg92/Performance-Analysis-JS
  const lt = player.lightTrails;
  const lightTrailOffset = 2;
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players[i].lightTrails.length; j++) {
      let trail = players[i].lightTrails[j];
      let trailHitbox = trail.getBoundingClientRect();
      if (
        !(
          hitboxRect.right < trailHitbox.left + lightTrailOffset ||
          hitboxRect.left > trailHitbox.right - lightTrailOffset ||
          hitboxRect.bottom < trailHitbox.top + lightTrailOffset ||
          hitboxRect.top > trailHitbox.bottom - lightTrailOffset
        )
      ) {
        // should be immune to your last 2 created trails
        if (
          (lt[lt.length - 1] && lt[lt.length - 1].id === trail.id) ||
          (lt[lt.length - 2] && lt[lt.length - 2].id === trail.id)
        ) {
          // skip
        } else {
          console.log(
            player.name,
            'collided with',
            players[i].name,
            'lighttrail'
          );
          return true;
        }
      }
    }
  }
  return false;
}

function createLightTrail(player) {
  // TODO: find a way to fill in the line without causing crashes
  // due to excess hitbox
  const lightTrail = two.makeLine(
    player.currentOrigin.x,
    player.currentOrigin.y,
    player.group.translation.x,
    player.group.translation.y
  );
  lightTrail.stroke = player.color;
  lightTrail.linewidth = 6;
  lightTrail.opacity = 0.9;
  lightTrail.origin = player.currentOrigin;

  // If lines have same origin, remove them from the list
  if (player.lightTrails.length > 0) {
    const lastTrail = player.lightTrails[player.lightTrails.length - 1];
    if (lastTrail.origin.equals(lightTrail.origin)) {
      two.remove(player.lightTrails.pop());
    }
  }
  player.lightTrails.push(lightTrail);
}

const speedPerTick = 1;
const leftVec = new Two.Vector(-speedPerTick, 0);
const rightVec = new Two.Vector(speedPerTick, 0);
const upVec = new Two.Vector(0, -speedPerTick);
const downVec = new Two.Vector(0, speedPerTick);

function isMoveLegal(player, direction) {
  // dont allow movements in opposite directions
  return (
    (direction === 'down' && player.prevDirection !== 'up') ||
    (direction === 'up' && player.prevDirection !== 'down') ||
    (direction === 'right' && player.prevDirection !== 'left') ||
    (direction === 'left' && player.prevDirection !== 'right')
  );
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMove(player, frameCount) {
  const cooldown = 6;
  // only register changes of directions every <cooldown> frames
  let direction = player.direction;
  if (
    player.direction !== player.prevDirection &&
    frameCount - player.lastMoveFrame > cooldown &&
    isMoveLegal(player, direction)
  ) {
    // set a new origin for the light trail
    player.currentOrigin = player.group.translation.clone();
    player.prevDirection = direction;
    player.lastMoveFrame = frameCount;
    // reset sound when turning
    player.sound.currentTime = 0;
    player.sound.play();
  } else {
    direction = player.prevDirection;
  }

  // use 3 separate conditions so you can accelerate and brake at the same time
  if (player.isAccelerating) {
    if (
      player.speed < maxSpeed &&
      frameCount - player.lastAccelerateFrame >
        accelerationTime[player.speed - 1]
    ) {
      player.speed += 1;
      player.lastAccelerateFrame = frameCount;
    }
  }
  if (player.isBraking) {
    if (player.speed > 1 && frameCount - player.lastBrakeFrame > brakeTime) {
      player.speed -= 1;
      player.lastBrakeFrame = frameCount;
    }
  }
  if (
    !player.isAccelerating &&
    !player.isBraking &&
    frameCount - player.lastDecelerateFrame > decelerationTime &&
    player.speed > 1
  ) {
    // by default player slows down if not accelerating or braking
    player.speed -= 1;
    player.lastDecelerateFrame = frameCount;
  }

  playBikeSound(player);

  const trn = player.group.translation;
  for (let i = 0; i < player.speed; i++) {
    switch (direction) {
      case 'left':
        trn.addSelf(leftVec);
        break;
      case 'right':
        trn.addSelf(rightVec);
        break;
      case 'up':
        trn.addSelf(upVec);
        break;
      case 'down':
        trn.addSelf(downVec);
        break;
    }
  }
  // TODO: might want to only check collisions when both players move already
  // P1 might have a slight advantage
  if (checkCollision(player)) {
    playDerezzSound();
    player.alive = false;
    two.remove(player.group);
    // create a corpse
    const pieces = [];
    const { offsetX, offsetY } = getOffsets(direction, -1);
    // create a random amount of pieces that fly in the opposite direction
    // player is facing. Size, distance, and quantity affected by speed
    const momentum = playerSize * player.speed * (player.speed / 2);
    const spreadFactor = playerSize;
    for (let i = 0; i < getRandomInt(6, 6 * (player.speed + 1)); i++) {
      const poly = two.makePolygon(
        trn.x + getRandomInt(-spreadFactor, spreadFactor),
        trn.y + getRandomInt(-spreadFactor, spreadFactor),
        getRandomInt(1, 3), //size
        3 // make triangles
      );
      poly.fill = player.trimColor;
      poly.noStroke();
      poly.rotation = getRandomInt(-10, 10);

      poly.translation.addSelf(
        new Two.Vector(
          getRandomInt(offsetX * playerSize, offsetX * momentum),
          getRandomInt(offsetY * playerSize, offsetY * momentum)
        )
      );
      pieces.push(poly);
    }
    const corpse = two.makeGroup(...pieces);
    player.corpse = corpse;
    gameOver = true;
    return;
  }
  createLightTrail(player);
  // Make circle on top of trail
  two.remove(player.group);
  player.group = createPlayerCircle(
    trn.x,
    trn.y,
    player.color,
    player.trimColor,
    direction
  );
}

let gameOver = true;
const gameInst = two.bind('update', frameCount => {
  stats.begin();
  if (!gameOver) {
    players.forEach(p => {
      generateMove(p, frameCount);
    });
  } else {
    let gameOverText = 'DRAW!';
    if (user.alive && !enemy.alive) {
      user.wins += 1;
      gameOverText = `${user.name} WINS!`;
    } else if (enemy.alive && !user.alive) {
      enemy.wins += 1;
      gameOverText = `${enemy.name} WINS!`;
    }
    document.getElementById('gameOverContainer').style.display = 'block';
    document.getElementById('gameOverText').innerText = gameOverText;
    document.getElementById('gameOverSubtext').innerText =
      'Press`r` to play again.';
    document.getElementById('tips-container').style.display = 'block';
    stopPlayerSounds();
    two.pause();
  }
  stats.end();
});
