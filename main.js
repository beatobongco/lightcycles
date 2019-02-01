const elem = document.getElementById('stage');

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

// create players
const playerSize = 6;
function createPlayerCircle(x, y, color) {
  const circle = two.makeCircle(x, y, playerSize);
  circle.stroke = color;
  circle.fill = '#fff';
  circle.linewidth = 2;
  return circle;
}

function initUser() {
  return {
    name: 'user',
    prevDirection: 'down',
    direction: 'down',
    speed: 1,
    alive: true,
    group: createPlayerCircle(gridSize, gridSize, '#3498db'),
    color: '#3498db',
    currentOrigin: new Two.Vector(gridSize, gridSize),
    lightTrails: []
  };
}

const user = initUser();

function initEnemy() {
  return {
    name: 'enemy',
    prevDirection: 'up',
    direction: 'up',
    speed: 1,
    alive: true,
    group: createPlayerCircle(
      stageWidth - gridSize,
      stageHeight - gridSize,
      '#e67e22'
    ),
    color: '#e67e22',
    currentOrigin: new Two.Vector(stageWidth - gridSize, stageWidth - gridSize),
    lightTrails: []
  };
}
const enemy = initEnemy();

const players = [user, enemy];

two.update();

function checkCollision(player) {
  const trn = player.group.translation;
  if (
    trn.x >= stageWidth - playerSize || // right limit
    trn.x <= 0 + playerSize || // left limit
    trn.y >= stageHeight - playerSize || // down limit
    trn.y <= 0 + playerSize // up limit
  ) {
    console.log('Hit the arena');
    return true;
  }

  const pr = player.group.getBoundingClientRect();
  let collidedWithTrail = players.some(_player => {
    return _player.lightTrails.some(trail => {
      const tr = trail.getBoundingClientRect();
      if (
        !(
          pr.right < tr.left ||
          pr.left > tr.right ||
          pr.bottom < tr.top ||
          pr.top > tr.bottom
        )
      ) {
        // should be immune to your last 2 created trails
        const lt = player.lightTrails;
        if (
          (lt[lt.length - 1] && lt[lt.length - 1].id === trail.id) ||
          (lt[lt.length - 2] && lt[lt.length - 2].id === trail.id)
        ) {
          // skip
        } else {
          console.log(player.name, 'collided with', _player.name, 'lighttrail');
          return true;
        }
      }
    });
  });
  return collidedWithTrail;
}

function createLightTrail(player) {
  // deferred creation of lighttrails
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

const speedPerTick = 1; //playerSize;
const leftVec = new Two.Vector(-speedPerTick, 0);
const rightVec = new Two.Vector(speedPerTick, 0);
const upVec = new Two.Vector(0, -speedPerTick);
const downVec = new Two.Vector(0, speedPerTick);

function generateMove(player) {
  const trn = player.group.translation;
  if (player.direction !== player.prevDirection) {
    player.currentOrigin = player.group.translation.clone();
  }
  for (let i = 0; i < player.speed; i++) {
    switch (player.direction) {
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
    if (checkCollision(player)) {
      console.log(player.name, 'died.');
      player.alive = false;
      two.remove(player.group);
      return;
    }
    createLightTrail(player);
    // Make circle on top of trail
    two.remove(player.group);
    player.group = createPlayerCircle(trn.x, trn.y, player.color);
  }
  player.prevDirection = player.direction;
}

function runTimes(n) {
  for (let i = 0; i < n; i++) {
    generateMove(user);
    two.update();
  }
}

const lightTrails = [];

document.body.onkeydown = k => {
  switch (k.code) {
    case 'Space':
      // reset();
      break;
    // user controls
    case 'KeyS':
      if (user.prevDirection !== 'up') {
        user.direction = 'down';
      }
      break;
    case 'KeyW':
      if (user.prevDirection !== 'down') {
        user.direction = 'up';
      }
      break;
    case 'KeyA':
      if (user.prevDirection !== 'right') {
        user.direction = 'left';
      }
      break;
    case 'KeyD':
      if (user.prevDirection !== 'left') {
        user.direction = 'right';
      }
      break;
    case 'KeyT':
      if (user.speed < 3) {
        user.speed += 1;
      }
      break;
    case 'KeyG':
      if (user.speed > 1) {
        user.speed -= 1;
      }
      break;
    // enemy controls
    case 'ArrowDown':
      if (enemy.prevDirection !== 'up') {
        enemy.direction = 'down';
      }
      break;
    case 'ArrowUp':
      if (enemy.prevDirection !== 'down') {
        enemy.direction = 'up';
      }
      break;
    case 'ArrowLeft':
      if (enemy.prevDirection !== 'right') {
        enemy.direction = 'left';
      }
      break;
    case 'ArrowRight':
      if (enemy.prevDirection !== 'left') {
        enemy.direction = 'right';
      }
      break;
    case 'BracketRight':
      if (enemy.speed < 3) {
        enemy.speed += 1;
      }
      break;
    case 'BracketLeft':
      if (enemy.speed > 1) {
        enemy.speed -= 1;
      }
      break;
  }
};
two
  .bind('update', frameCount => {
    if (players.every(p => p.alive)) {
      generateMove(user);
      generateMove(enemy);
    }
  })
  .play();
