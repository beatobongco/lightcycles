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
const stageWidth = 36 * gridSize; // x limit
const stageHeight = 36 * gridSize; // y limit

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
const hitboxOffset = 0;

function createPlayerCircle(x, y, strokeColor, fillColor, direction) {
  const circle = two.makeCircle(x, y, playerSize);
  circle.stroke = strokeColor;
  circle.fill = fillColor;
  circle.linewidth = 2;
  const { offsetX, offsetY } = getOffsets(direction, hitboxOffset);
  const hitbox = two.makeRectangle(
    x + offsetX,
    y + offsetY,
    hitboxSize,
    hitboxSize
  );
  hitbox.fill = 'red';
  hitbox.noFill();
  hitbox.noStroke();
  const group = two.makeGroup(circle, hitbox);
  group.center();
  group.translation.set(x, y);
  return group;
}

function createHUD(el, name, wins, roundWins, speed) {
  let winDots = [
    '<span class="windot">&#9675;</span>',
    '<span class="windot">&#9675;</span>',
    '<span class="windot">&#9675;</span>'
  ];

  for (let i = 0; i < roundWins; i++) {
    winDots[i] = '<span class="windot">&#9679;</span>';
  }
  document.getElementById(el).innerHTML = `
    <div class="hud">
      <h3>${name}</h3>
      <p><small>WINS</small></p>
      <h3 id="${name}-wins">${wins}</h3>
      <p><small>ROUND</small></p>
      <div class="rounds">${winDots.join('')}</div>
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
  roundWins,
  strokeColor,
  fillColor,
  HUDelement
) {
  const p = {
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
    get wins() {
      return this._wins;
    },
    set wins(wns) {
      this._wins = wns;
      createHUD(HUDelement, name, wns, this.roundWins, this._speed);
    },
    _roundWins: roundWins,
    get roundWins() {
      return this._roundWins;
    },
    set roundWins(rnd) {
      this._roundWins = rnd;
      createHUD(HUDelement, name, this.wins, rnd, this._speed);
    },
    isAccelerating: false,
    isBraking: false,
    lastDecelerateFrame: 0,
    lastAccelerateFrame: 0,
    lastBrakeFrame: 0,
    alive: true,
    _wins: wins,
    group: createPlayerCircle(x, y, strokeColor, fillColor, defaultDirection),
    fillColor: fillColor,
    strokeColor: strokeColor,
    originalFill: fillColor,
    lightTrailColor: strokeColor,
    currentOrigin: new Two.Vector(x, y),
    lightTrails: [],
    corpse: null,
    sound: new Audio(),
    soundPromise: null
  };
  createHUD(HUDelement, name, wins, roundWins, 1);

  return p;
}

function initUser(wins, roundWins) {
  return initPlayer(
    'P1',
    Math.round(stageWidth / 2),
    gridSize * 8,
    'down',
    wins,
    roundWins,
    '#3498db',
    '#ffffff',
    'userHud'
  );
}

let user = initUser(0, 0);

function initEnemy(wins, roundWins) {
  return initPlayer(
    'P2',
    Math.round(stageWidth / 2),
    stageHeight - gridSize * 8,
    'up',
    wins,
    roundWins,
    '#e67e22',
    '#000000',
    'enemyHud'
  );
}

let enemy = initEnemy(0, 0);

let players = [user, enemy];

two.update();

function checkCollision(player, lightTrailOffset = 2) {
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
  lightTrail.stroke = player.lightTrailColor;
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
  let bonus = 0;
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
  } else if (
    frameCount - player.lastDecelerateFrame > decelerationTime &&
    player.speed > 1
  ) {
    // by default player slows down
    player.speed -= 1;
    player.lastDecelerateFrame = frameCount;
  }

  if (checkCollision(player, -3)) {
    // TODO: add directional sparks here
    player.fillColor = '#e74c3c';
    bonus = Math.ceil(player.speed * 0.5);
  } else {
    player.fillColor = player.originalFill;
  }

  let cooldown = 6;
  let newCoolDown = cooldown - player.speed - bonus;

  if (newCoolDown > 0) {
    cooldown = newCoolDown;
  } else if (player.speed === maxSpeed) {
    cooldown = 0;
  } else {
    cooldown = 1;
  }

  const trn = player.group.translation;
  // only register changes of directions every <cooldown> frames
  let direction = player.direction;

  for (let i = 0; i < player.speed + bonus; i++) {
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
    } else {
      direction = player.prevDirection;
    }
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
  playBikeSound(player, bonus);
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
      poly.fill = player.originalFill;
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
    player.strokeColor,
    player.fillColor,
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
      user.roundWins += 1;
      gameOverText = `${user.name} derezzed ${enemy.name}!`;
    } else if (enemy.alive && !user.alive) {
      enemy.roundWins += 1;
      gameOverText = `${enemy.name} derezzed ${user.name}!`;
    }
    document.getElementById('gameOverSubtext').innerText =
      'Press`r` to play next round.';

    players.some(p => {
      if (p.roundWins === 3) {
        if (user.alive && !enemy.alive) {
          user.wins += 1;
          gameOverText = `${user.name} wins!`;
        } else if (enemy.alive && !user.alive) {
          enemy.wins += 1;
          gameOverText = `${enemy.name} wins!`;
        }
        document.getElementById('gameOverSubtext').innerText =
          'Press`r` for rematch.';
        return true;
      }
    });
    document.getElementById('gameOverContainer').style.display = 'block';
    document.getElementById('gameOverText').innerText = gameOverText;
    document.getElementById('tips-container').style.display = 'block';
    stopPlayerSounds();
    two.pause();
  }
  stats.end();
});
