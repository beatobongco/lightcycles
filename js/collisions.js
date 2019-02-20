let checkCollision = (player, lightTrailOffset = 2) => {
  const _checkCollision = (a, b, offset = 0) => {
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
  };

  // Determines if player's hitbox collided with or is near collidable objects
  // Returns {didCollide: bool, oppositeDir: vector for effects where valid}
  const hitboxRect = player.group._collection[1].getBoundingClientRect();

  // BIT
  if (bit && _checkCollision(hitboxRect, bit.getBoundingClientRect())) {
    console.log(player.score);
    generateBit();
  }
  // END BIT

  if (
    hitboxRect.right >= stageWidth ||
    hitboxRect.left <= 0 ||
    hitboxRect.bottom >= stageHeight ||
    hitboxRect.top <= 0
  ) {
    return { didCollide: true, oppositeDir: null };
  }

  // Use for-loops instead for better performance
  // https://github.com/dg92/Performance-Analysis-JS
  const lt = player.lightTrails;
  for (let i = 0; i < players.length; i++) {
    if (
      player.name !== players[i].name &&
      _checkCollision(
        hitboxRect,
        players[i].group._collection[1].getBoundingClientRect(),
        lightTrailOffset
      )
    ) {
      return { didCollide: true, oppositeDir: null };
    }

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
      if (_checkCollision(hitboxRect, trailHitbox, lightTrailOffset)) {
        if (hitboxRect.right > trailHitbox.right) {
          return { didCollide: true, oppositeDir: rightVec };
        } else if (hitboxRect.left < trailHitbox.left) {
          return { didCollide: true, oppositeDir: leftVec };
        } else if (hitboxRect.bottom > trailHitbox.bottom) {
          return { didCollide: true, oppositeDir: downVec };
        } else if (hitboxRect.top < trailHitbox.top) {
          return { didCollide: true, oppositeDir: upVec };
        }
      }
    }
  }
  return { didCollide: false, oppositeDir: null };
};

function checkPlayerCollision(player, direction) {
  const collision = checkCollision(player);
  if (collision.didCollide) {
    playDerezzSound();
    player.alive = false;
    two.remove(player.group);
    const { oppX, oppY } = getOppositeDirection(direction);
    player.corpse = createShards(
      player.group.translation,
      player.fillColor,
      oppX,
      oppY,
      getRandomInt(3, 3 * player.speed),
      playerSize * player.speed * (player.speed / 2),
      2,
      3
    );
  }
}
