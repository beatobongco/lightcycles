import {
  stageHeight,
  stageWidth,
  upVec,
  downVec,
  leftVec,
  rightVec,
  playerSize
} from './constants';
import { createShards, getRandomInt } from './util';
import { playShieldSound } from './sound';
import { getRegion, regions } from './grid';

function didCollide(a, b, offset = 0) {
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
  const result = { didCollide: false };
  let lightTrailOffset = 0;
  let hitbox = obj.getHitbox();
  if (slipstream) {
    // use the big circle for slipstreams
    hitbox = obj.getSsHitbox();
    lightTrailOffset = -4;
  }
  const { x, y } = obj.group.translation;
  const region = getRegion(x, y);
  const { lightTrails } = regions[region];
  for (let i = 0; i < lightTrails.length; i++) {
    const lt = lightTrails[i];
    //Immune to own lighttrails for slipstream
    if (slipstream && obj.name === lt.owner.name) {
      continue;
    }
    // Decided to go with immunity to the last 2 trails instead of invulnerable back portion of cycle
    if (obj.type === 'player') {
      const trails = obj.immuneTrails;
      if (
        (trails.length >= 1 && trails[trails.length - 1] === lt.origin) ||
        (trails.length >= 2 && trails[trails.length - 2] === lt.origin) ||
        obj.trailPoint.equals(lt.origin)
      ) {
        continue;
      }
    }

    const trailHitbox = lt.getBoundingClientRect();
    if (didCollide(hitbox, trailHitbox, lightTrailOffset)) {
      result.didCollide = true;
      result.color = lt.owner.turboColor;
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
  return result;
}

function checkPlayerCollision(player) {
  const result = { didCollide: false };
  const hitbox = player.getHitbox();
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
      didCollide(player.getHitbox(), G.players[i].getHitbox())
    ) {
      result.didCollide = true;
      return result;
    }
  }
  // LIGHTTRAILS
  const lightTrailCollision = checkLightTrailCollision(player);
  if (lightTrailCollision.didCollide) {
    // We check for shield collision here but we dont deactivate it just yet
    // because we want it to last a whole turn / update call
    // The problem with deactivating it right away is that
    // It might trigger for the next pixel collision check which would
    // render the shield useless if the conditions are right
    if (player.hasShield) {
      // dont trigger collision if player has shield, and only show shatters once
      result.didCollide = false;
      if (player.shieldDist === 0) {
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
      }
      player.shieldDist += 1;
    } else {
      return lightTrailCollision;
    }
  } else if (player.hasShield && player.shieldDist > 0) {
    // We need to increment shield distance also even if nothing collided to make sure it wears off
    // I found cases wherein there was one shield frame left after going through a wall
    // The player was still blue but would die upon next impact
    player.shieldDist += 1;
  }
  // BIT
  if (G.bit && didCollide(hitbox, G.bit.group.getBoundingClientRect())) {
    result.obtainedBit = true;
  }
  // END BIT
  return result;
}

function checkCollision(obj) {
  // Determines if an objects hitbox collided with or is near collidable objects (so far just light trails and walls)
  // mostly used for non-player objects like bit or powerups
  // Returns {didCollide: bool, oppositeDir: vector for effects where valid}
  const result = { didCollide: false };
  const hitbox = obj.getHitbox();
  // WALLS
  if (
    hitbox.right >= stageWidth ||
    hitbox.left <= 0 ||
    hitbox.bottom >= stageHeight ||
    hitbox.top <= 0
  ) {
    result.didCollide = true;
    // TODO: this could be buggy, race conditions
    if (hitbox.right >= stageWidth) {
      result.oppositeDir = leftVec;
    } else if (hitbox.left <= 0) {
      result.oppositeDir = rightVec;
    } else if (hitbox.bottom >= stageHeight) {
      result.oppositeDir = upVec;
    } else if (hitbox.top <= 0) {
      result.oppositeDir = downVec;
    }
    return result;
  }
  // LIGHTTRAILS
  return checkLightTrailCollision(obj);
}

export { checkCollision, checkLightTrailCollision, checkPlayerCollision };
