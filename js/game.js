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
// TODO: Make small hitboxes on the head of the circle to avoid colliding when turning fast
const playerSize = 6;
const hitboxSize = 5;
const hitboxOffset = 3;
function createPlayerCircle(x, y, color, direction) {
  const circle = two.makeCircle(x, y, playerSize);
  circle.stroke = color;
  circle.fill = '#fff';
  circle.linewidth = 2;
  let offsetX = 0;
  let offsetY = 0;
  switch (direction) {
    case 'up':
      offsetY = -hitboxOffset;
      break;
    case 'down':
      offsetY = hitboxOffset;
      break;
    case 'left':
      offsetX = -hitboxOffset;
      break;
    case 'right':
      offsetX = hitboxOffset;
      break;
  }
  const hitbox = two.makeRectangle(
    x + offsetX,
    y + offsetY,
    hitboxSize,
    hitboxSize
  );
  hitbox.fill = '#FF0000';
  hitbox.noStroke();
  const group = two.makeGroup(circle, hitbox);
  group.center();
  group.translation.set(x, y);
  return group;
}

function initUser() {
  return {
    name: 'user',
    prevDirection: 'down',
    direction: 'down',
    lastMoveFrame: 0,
    speed: 1,
    alive: true,
    group: createPlayerCircle(gridSize, gridSize, '#3498db', 'down'),
    color: '#3498db',
    currentOrigin: new Two.Vector(gridSize, gridSize),
    lightTrails: []
  };
}

let user = initUser();

function initEnemy() {
  return {
    name: 'enemy',
    prevDirection: 'up',
    direction: 'up',
    lastMoveFrame: 0,
    speed: 1,
    alive: true,
    group: createPlayerCircle(
      stageWidth - gridSize,
      stageHeight - gridSize,
      '#e67e22',
      'up'
    ),
    color: '#e67e22',
    currentOrigin: new Two.Vector(stageWidth - gridSize, stageWidth - gridSize),
    lightTrails: []
  };
}
let enemy = initEnemy();

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
    console.log('Hit the arena');
    return true;
  }

  const hitboxRect = player.group._collection[1].getBoundingClientRect();
  let collidedWithTrail = players.some(_player => {
    return _player.lightTrails.some(trail => {
      const trailHitbox = trail.getBoundingClientRect();
      if (
        !(
          hitboxRect.right < trailHitbox.left ||
          hitboxRect.left > trailHitbox.right ||
          hitboxRect.bottom < trailHitbox.top ||
          hitboxRect.top > trailHitbox.bottom
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

function generateMove(player, frameCount) {
  const cooldown = 6;
  // only register changes of directions every <cooldown> frames
  let direction = player.direction;
  if (
    player.direction !== player.prevDirection &&
    frameCount - player.lastMoveFrame > cooldown
  ) {
    player.currentOrigin = player.group.translation.clone();
    player.prevDirection = direction;
    player.lastMoveFrame = frameCount;
  } else {
    direction = player.prevDirection;
  }
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
    if (checkCollision(player)) {
      console.log(player.name, 'died.');
      player.alive = false;
      two.remove(player.group);
      return;
    }
    createLightTrail(player);
    // Make circle on top of trail
    two.remove(player.group);
    player.group = createPlayerCircle(
      trn.x,
      trn.y,
      player.color,
      player.direction
    );
  }
}

function reset() {
  if (players.some(p => !p.alive)) {
    players.forEach(p => {
      two.remove(p.group);
      p.lightTrails.forEach(l => {
        two.remove(l);
      });
    });
    user = initUser();
    enemy = initEnemy();
    players = [user, enemy];
    two.update();
  }
}

two
  .bind('update', frameCount => {
    if (players.every(p => p.alive)) {
      generateMove(user, frameCount);
      generateMove(enemy, frameCount);
    }
  })
  .play();
