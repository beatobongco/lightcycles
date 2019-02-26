import {
  stageHeight,
  stageWidth,
  upVec,
  downVec,
  leftVec,
  rightVec,
  playerSize
} from './constants';

function checkCollision(
  hitboxRect,
  player = null,
  lightTrailOffset = 0,
  ignoreWalls = false
) {
  // TODO: need to refactor this, maybe for bit
  function _checkCollision(a, b, offset = 0) {
    // Depending on the direction you're going
    // Make sure collision on your butt has a buffer
    // so (1) you dont derezz yourself
    // and (2) you dont get a speed boost
    let bottomOffset = 0,
      topOffset = 0,
      leftOffset = 0,
      rightOffset = 0;
    if (player) {
      if (player.direction === 'up') {
        topOffset = playerSize;
      } else if (player.direction === 'down') {
        bottomOffset = playerSize;
      } else if (player.direction === 'left') {
        leftOffset = playerSize;
      } else if (player.direction === 'right') {
        rightOffset = playerSize;
      }
    }
    if (
      !(
        a.right < b.left + offset + leftOffset ||
        a.left > b.right - offset - rightOffset ||
        a.bottom < b.top + offset + topOffset ||
        a.top > b.bottom - offset - bottomOffset
      )
    ) {
      return true;
    }
  }

  // Determines if an objects hitbox collided with or is near collidable objects
  // Returns {didCollide: bool, oppositeDir: vector for effects where valid}
  const result = { didCollide: false };
  // BIT
  if (G.bit && _checkCollision(hitboxRect, G.bit.getBoundingClientRect())) {
    result.obtainedBit = true;
  }
  // END BIT
  if (!ignoreWalls) {
    if (
      hitboxRect.right >= stageWidth ||
      hitboxRect.left <= 0 ||
      hitboxRect.bottom >= stageHeight ||
      hitboxRect.top <= 0
    ) {
      result.didCollide = true;
      return result;
    }
  }

  // Use for-loops instead for better performance
  // https://github.com/dg92/Performance-Analysis-JS
  for (let i = 0; i < G.players.length; i++) {
    if (
      player &&
      player.name !== G.players[i].name &&
      _checkCollision(
        hitboxRect,
        G.players[i].group._collection[1].getBoundingClientRect(),
        lightTrailOffset
      )
    ) {
      result.didCollide = true;
      return result;
    }

    for (let j = 0; j < G.players[i].lightTrails.length; j++) {
      let trail = G.players[i].lightTrails[j];

      // Immune to the last trail if player hasn't yet detached from it
      if (player && trail.origin.equals(player.currentOrigin)) {
        continue;
      }

      let trailHitbox = trail.getBoundingClientRect();
      if (_checkCollision(hitboxRect, trailHitbox, lightTrailOffset)) {
        result.didCollide = true;
        if (hitboxRect.right > trailHitbox.right) {
          result.oppositeDir = rightVec;
        } else if (hitboxRect.left < trailHitbox.left) {
          result.oppositeDir = leftVec;
        } else if (hitboxRect.bottom > trailHitbox.bottom) {
          result.oppositeDir = downVec;
        } else if (hitboxRect.top < trailHitbox.top) {
          result.oppositeDir = upVec;
        }
      }
    }
  }
  return result;
}

export { checkCollision };
