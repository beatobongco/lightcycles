import {
  stageHeight,
  stageWidth,
  upVec,
  downVec,
  leftVec,
  rightVec,
  playerSize,
  hitboxSize
} from './constants';
import { createShards, getRandomInt } from './util';
import { playShieldSound } from './sound';

// A NOTE ON PLAYER COLLECTIONS
// 0: big player circle
// 1: smaller hitbox

function _playerCollision(player, b, offset = 0) {
  const hitbox = player.group._collection[1].getBoundingClientRect();
  // Depending on the direction you're going
  // Make sure collision on your butt has a buffer
  // so (1) you dont derezz yourself
  // and (2) you dont get a speed boost

  // Offsets make b's hitbox "smaller"
  let bottomOffset = 0,
    topOffset = 0,
    leftOffset = 0,
    rightOffset = 0;
  // If offset is any smaller, when turning you will get zebra lighttrails
  // from speed bonus from the collision with your tail
  const invulnOffset = playerSize;
  if (player.direction === 'up') {
    topOffset = invulnOffset;
  } else if (player.direction === 'down') {
    bottomOffset = invulnOffset;
  } else if (player.direction === 'left') {
    leftOffset = invulnOffset;
  } else if (player.direction === 'right') {
    rightOffset = invulnOffset;
  }

  if (
    !(
      hitbox.right < b.left + offset + leftOffset ||
      hitbox.left > b.right - offset - rightOffset ||
      hitbox.bottom < b.top + offset + topOffset ||
      hitbox.top > b.bottom - offset - bottomOffset
    )
  ) {
    return true;
  }
}

function _regularCollision(a, b, offset = 0) {
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

function checkLightTrailCollision(obj, slipstream = false) {
  // TODO: can be optimized by using regions
  let hitbox = obj;
  let player = null;
  let collisionFunc = _regularCollision;
  // was: hitboxSize / 2 to allow players to really stick to lighttrails
  // it was reduced to 0 to prevent bugs where you would collid with enemy while
  // slipstreaming
  let lightTrailOffset = 0;
  if (obj.type && obj.type === 'player') {
    player = obj;
    hitbox = player.group._collection[1].getBoundingClientRect();
    // use the big circle for slipstreams
    if (slipstream) {
      hitbox = player.group._collection[0].getBoundingClientRect();
      lightTrailOffset = -4;
    }
    collisionFunc = _playerCollision;
  }

  const result = { didCollide: false };

  for (let i = 0; i < G.players.length; i++) {
    for (let j = 0; j < G.players[i].lightTrails.length; j++) {
      //Immune to own lighttrails for slipstream
      if (slipstream && player.name === G.players[i].name) {
        continue;
      }
      let trail = G.players[i].lightTrails[j];

      // Immune to the last trail if player hasn't yet detached from it
      if (player && trail.origin.equals(player.currentOrigin)) {
        continue;
      }

      let trailHitbox = trail.getBoundingClientRect();
      if (collisionFunc(obj, trailHitbox, lightTrailOffset)) {
        result.didCollide = true;
        result.color = G.players[i].sparkColor;
        if (hitbox.right > trailHitbox.right) {
          result.oppositeDir = rightVec;
        } else if (hitbox.left < trailHitbox.left) {
          result.oppositeDir = leftVec;
        } else if (hitbox.bottom > trailHitbox.bottom) {
          result.oppositeDir = downVec;
        } else if (hitbox.top < trailHitbox.top) {
          result.oppositeDir = upVec;
        }
      }
    }
  }
  return result;
}

function checkPlayerCollision(player) {
  const result = { didCollide: false };
  const hitbox = player.group._collection[1].getBoundingClientRect();
  // WALLS
  if (
    hitbox.right >= stageWidth ||
    hitbox.left <= 0 ||
    hitbox.bottom >= stageHeight ||
    hitbox.top <= 0
  ) {
    result.didCollide = true;
    return result;
  }
  // OTHER PLAYERS
  for (let i = 0; i < G.players.length; i++) {
    if (
      player.name !== G.players[i].name &&
      _regularCollision(
        player.group._collection[1].getBoundingClientRect(),
        G.players[i].group._collection[1].getBoundingClientRect()
      )
    ) {
      result.didCollide = true;
      return result;
    }
  }
  // LIGHTTRAILS
  const lightTrailCollision = checkLightTrailCollision(player, false);
  if (lightTrailCollision.didCollide) {
    // We check for shield collision here but we dont deactivate it just yet
    // because we want it to last a whole turn / update call
    // The problem with deactivating it right away is that
    // It might trigger for the next pixel collision check which would
    // render the shield useless if the conditions are right
    if (player.hasShield) {
      playShieldSound();
      player.corpses.push(
        createShards(
          player.group.translation,
          lightTrailCollision.color,
          0,
          0,
          getRandomInt(3, 3 * player.speed),
          playerSize * player.speed,
          2,
          3,
          playerSize * 2
        )
      );
      result.didCollide = false;
      result.usedShield = true;
    } else {
      return lightTrailCollision;
    }
  }
  // BIT
  if (G.bit && _regularCollision(hitbox, G.bit.group.getBoundingClientRect())) {
    result.obtainedBit = true;
  }
  // END BIT
  return result;
}

function checkCollision(hitbox) {
  // Determines if an objects hitbox collided with or is near collidable objects (so far just light trails and walls)
  // mostly used for non-player objects like bit or powerups
  // Returns {didCollide: bool, oppositeDir: vector for effects where valid}
  const result = { didCollide: false };
  // WALLS
  if (
    hitbox.right >= stageWidth ||
    hitbox.left <= 0 ||
    hitbox.bottom >= stageHeight ||
    hitbox.top <= 0
  ) {
    result.didCollide = true;
    return result;
  }
  // LIGHTTRAILS
  return checkLightTrailCollision(hitbox);
}

export { checkCollision, checkLightTrailCollision, checkPlayerCollision };
