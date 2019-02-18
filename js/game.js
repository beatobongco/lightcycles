const elem = document.getElementById('stage');
let maxSpeed = 6;
let decelerationTime = 3;
const accelerationTime = [3, 4, 6, 14, 16];
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
stage.linewidth = 3;

// create grid
for (let x = 0; x <= stageWidth; x += gridSize) {
  two.makeLine(x, 0, x, stageHeight).stroke = '#fff';
}
for (let y = 0; y <= stageHeight; y += gridSize) {
  two.makeLine(0, y, stageWidth, y).stroke = '#fff';
}

// create players
const playerSize = 6;
const hitboxSize = 6;

function createPlayerCircle(x, y, strokeColor, fillColor) {
  const circle = two.makeCircle(x, y, playerSize);
  circle.stroke = strokeColor;
  circle.fill = fillColor;
  circle.linewidth = 2;
  const hitbox = two.makeRectangle(x, y, hitboxSize, hitboxSize);
  hitbox.fill = 'red'; // for debugging
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
  winsHTML =
    wins > 0 ? `WINS: <span id="${name}-wins">${wins}</span>` : '&nbsp;';
  document.getElementById(el).innerHTML = `
    <div class="hud">
      <h3>${name}</h3>
      <p><small>ROUND</small></p>
      <div class="rounds">${winDots.join('')}</div>
      <p><small>SPEED</small></p>
      <h3 id="${name}-speed">${speed}</h3>
      <small class="tiny">${winsHTML}</small>
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
  turboColor,
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
    group: createPlayerCircle(x, y, strokeColor, fillColor),
    fillColor: fillColor,
    strokeColor: strokeColor,
    originalStroke: strokeColor,
    turboColor: turboColor,
    currentOrigin: new Two.Vector(x, y),
    lightTrails: [],
    corpse: null,
    sparks: null,
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
    '#67CBFF',
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
    '#FFB155',
    'enemyHud'
  );
}

let enemy = initEnemy(0, 0);

let players = [user, enemy];

two.update();

function checkCollision(player, lightTrailOffset = 2) {
  // tells us if player collided and in what direction to throw effects
  const hitboxRect = player.group._collection[1].getBoundingClientRect();
  if (hitboxRect.right >= stageWidth) {
    return { didCollide: true, oppositeDir: leftVec };
  } else if (hitboxRect.left <= 0) {
    return { didCollide: true, oppositeDir: rightVec };
  } else if (hitboxRect.bottom >= stageHeight) {
    return { didCollide: true, oppositeDir: upVec };
  } else if (hitboxRect.top <= 0) {
    return { didCollide: true, oppositeDir: downVec };
  }
  // Use for-loops instead for better performance
  // https://github.com/dg92/Performance-Analysis-JS
  const lt = player.lightTrails;
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players[i].lightTrails.length; j++) {
      let trail = players[i].lightTrails[j];
      // should be immune to your last 2 created trails
      if (
        (lt[lt.length - 1] && lt[lt.length - 1].id === trail.id) ||
        (lt[lt.length - 2] && lt[lt.length - 2].id === trail.id)
      ) {
        continue;
      }

      let trailHitbox = trail.getBoundingClientRect();
      if (
        !(
          hitboxRect.right < trailHitbox.left + lightTrailOffset ||
          hitboxRect.left > trailHitbox.right - lightTrailOffset ||
          hitboxRect.bottom < trailHitbox.top + lightTrailOffset ||
          hitboxRect.top > trailHitbox.bottom - lightTrailOffset
        )
      ) {
        if (hitboxRect.right > trailHitbox.right) {
          return { didCollide: true, oppositeDir: leftVec };
        } else if (hitboxRect.left < trailHitbox.left) {
          return { didCollide: true, oppositeDir: rightVec };
        } else if (hitboxRect.bottom > trailHitbox.bottom) {
          return { didCollide: true, oppositeDir: downVec };
        } else if (hitboxRect.top < trailHitbox.top) {
          return { didCollide: true, oppositeDir: upVec };
        }
      }
    }
  }
  return { didCollide: false, oppositeDir: null };
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
  lightTrail.stroke = player.strokeColor;
  lightTrail.linewidth = 6;
  lightTrail.opacity = 0.9;
  lightTrail.origin = player.currentOrigin;

  // If lines have same origin, remove them from the list
  if (player.lightTrails.length > 0) {
    const lastTrail = player.lightTrails[player.lightTrails.length - 1];
    if (
      lastTrail.origin.equals(lightTrail.origin) &&
      lastTrail.stroke === lightTrail.stroke
    ) {
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createShards(
  origin,
  color,
  offsetX,
  offsetY,
  pieces,
  momentum,
  minSize = 1,
  maxSize = 3,
  spreadFactor = playerSize
) {
  // creates a shards effect in a certain direction
  const _pieces = [];
  for (let i = 0; i < pieces; i++) {
    const poly = two.makePolygon(
      origin.x + getRandomInt(-spreadFactor, spreadFactor),
      origin.y + getRandomInt(-spreadFactor, spreadFactor),
      getRandomInt(minSize, maxSize), //size
      3 // make triangles
    );
    poly.fill = color;
    poly.noStroke();
    poly.rotation = getRandomInt(-10, 10);

    poly.translation.addSelf(
      new Two.Vector(
        getRandomInt(offsetX * spreadFactor, offsetX * momentum),
        getRandomInt(offsetY * spreadFactor, offsetY * momentum)
      )
    );
    _pieces.push(poly);
  }
  return two.makeGroup(..._pieces);
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

  const slipstream = checkCollision(player, -3);
  if (slipstream.didCollide) {
    bonus = Math.ceil(player.speed * 0.5);
    if (
      player.strokeColor !== player.turboColor &&
      player.speed + bonus > maxSpeed
    ) {
      // drop a new origin for turbo
      player.strokeColor = player.turboColor;
      player.currentOrigin = player.group.translation.clone();
    }
  }

  if (
    player.strokeColor === player.turboColor &&
    player.speed + bonus <= maxSpeed
  ) {
    player.strokeColor = player.originalStroke;
    player.currentOrigin = player.group.translation.clone();
  }

  let cooldown = Math.max(0, 6 / Math.max(1, player.speed - bonus));
  if (player.speed === maxSpeed) {
    cooldown = 0;
  }
  // only register changes of directions every <cooldown> frames
  let direction = player.direction;
  const trn = player.group.translation;

  for (let i = 0; i < player.speed + bonus; i++) {
    if (
      player.direction !== player.prevDirection &&
      frameCount - player.lastMoveFrame > cooldown
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
  const collision = checkCollision(player);
  if (collision.didCollide) {
    playDerezzSound();
    player.alive = false;
    two.remove(player.group);
    const { x, y } = collision.oppositeDir;
    player.corpse = createShards(
      player.group.translation,
      player.fillColor,
      x,
      y,
      getRandomInt(3, 3 * player.speed),
      playerSize * player.speed * (player.speed / 2),
      2,
      3
    );
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
    player.fillColor
  );
  two.remove(player.sparks);
  if (slipstream.didCollide) {
    // https://codepen.io/anon/pen/wNRegz
    const base = 1 + player.speed;
    let offsetX = 0,
      offsetY = 0;
    if (direction === 'up') {
      offsetY = base;
    } else if (direction === 'down') {
      offsetY = -base;
    } else if (direction === 'right') {
      offsetX = -base;
    } else if (direction === 'left') {
      offsetX = base;
    }
    const { x, y } = slipstream.oppositeDir;
    player.sparks = createShards(
      player.group.translation,
      player.turboColor,
      x + offsetX,
      y + offsetY,
      getRandomInt(3, 3 + player.speed),
      base * player.speed,
      1,
      2
    );
  }
}

let gameOver = true;
let gameOverText = null;
const gameInst = two.bind('update', frameCount => {
  stats.begin();
  if (!gameOver) {
    players.forEach(p => {
      generateMove(p, frameCount);
    });
  } else {
    clearInterval(gameTimer);

    if (user.alive && !enemy.alive) {
      gameOverText = `${user.name} WINS`;
      user.roundWins += 1;
    } else if (enemy.alive && !user.alive) {
      gameOverText = `${enemy.name} WINS`;
      enemy.roundWins += 1;
    } else {
      gameOverText = 'DRAW';
    }
    document.getElementById('gameOverSubtext').innerText =
      'Press `R` to play next round.';

    players.some(p => {
      if (p.roundWins === 3) {
        if (user.alive && !enemy.alive) {
          user.wins += 1;
          gameOverText = `${user.name} WINS THE MATCH`;
        } else if (enemy.alive && !user.alive) {
          enemy.wins += 1;
          gameOverText = `${enemy.name} WINS THE MATCH`;
        }
        document.getElementById(
          'gameOverSubtext'
        ).innerText = `Press \`R\` for rematch.`;
        return true;
      }
    });
    document.getElementById('gameOverContainer').style.display = 'flex';
    document.getElementById('gameOverText').innerText = gameOverText;
    stopPlayerSounds();
    two.pause();
  }
  stats.end();
});
