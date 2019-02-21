import {
  two,
  stageHeight,
  stageWidth,
  upVec,
  downVec,
  leftVec,
  rightVec
} from './constants';

function checkCollision(hitboxRect, player = null, lightTrailOffset = 2) {
  function _checkCollision(a, b, offset = 0) {
    if (
      !(
        a.right < b.left + offset ||
        a.left > b.right - offset ||
        a.bottom < b.top + offset ||
        a.top > b.bottom - offset
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

  if (
    hitboxRect.right >= stageWidth ||
    hitboxRect.left <= 0 ||
    hitboxRect.bottom >= stageHeight ||
    hitboxRect.top <= 0
  ) {
    result.didCollide = true;
    return result;
  }

  // Use for-loops instead for better performance
  // https://github.com/dg92/Performance-Analysis-JS
  const lt = player ? player.lightTrails : [];
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
      // should be immune to your last 2 created trails
      if (
        player &&
        ((lt[lt.length - 1] && lt[lt.length - 1].id === trail.id) ||
          (lt[lt.length - 2] && lt[lt.length - 2].id === trail.id))
      ) {
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

function checkPlayerCollision(player, offset) {
  return checkCollision(
    player.group._collection[1].getBoundingClientRect(),
    player,
    offset
  );
}

export { checkCollision, checkPlayerCollision };
