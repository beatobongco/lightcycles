import { two, upVec, downVec, leftVec, rightVec } from './constants';
import { getRandomInt } from './util';
import { checkCollision } from './collisions';
import { playBitSpawnSound, playShieldSpawnSound } from './sound';
import { regions, getRegion } from './grid';

function generateBit(sameAsLast) {
  // TODO: figure out algorithm to make bit spawn in reachable places (by both players)
  // Maybe can use a modified A* algorithm optimized for speed
  // Generates a little guy you can get for points
  // every 5 seconds 20% chance to spawn shield bit
  let type = 'normal';
  // TODO: sometimes bit doesn't exist
  if (G.bit && sameAsLast) {
    type = G.bit.type;
  } else if (getRandomInt(0, 4) === 0) {
    type = 'shield';
  }

  if (G.bit) {
    G.bit.remove();
  }
  let outerFill = '#1abc9c';
  let innerFill = '#E6FFFF';
  if (type === 'shield') {
    innerFill = '#0652DD';
    outerFill = '#1B1464';
  }
  let group, inner, outer;
  outer = two.makeCircle(0, 0, 7);
  outer.fill = outerFill;
  outer.noStroke();
  outer.opacity = 0.9;
  inner = two.makeCircle(0, 0, 5);
  inner.fill = innerFill;
  inner.noStroke();
  group = two.makeGroup(outer, inner);
  group.center();

  // TODO: Implement A* where bit will spawn in an area reachable by both players
  // Create a heuristic also so that it spawns somewhere that has a good chance that both can reach
  // Maybe lean regions is enough.
  // Spawn bit in regions with least number of trails
  let min = 1000;
  let leanRegions = [];
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const numTrails = region.lightTrails.length;
    if (numTrails < min) {
      min = numTrails;
      leanRegions = [i];
    } else if (numTrails === min) {
      leanRegions.push(i);
    }
  }
  let regionIndex = null;
  // For 1P mode, bit will try to spawn in leanest (least trails) region and not in the player's region
  if (leanRegions.length > 0) {
    regionIndex = leanRegions[getRandomInt(0, leanRegions.length - 1)];
    const { x, y } = G.players[0].group.translation;
    if (regionIndex === G.prevBitRegion || regionIndex === getRegion(x, y)) {
      if (
        G.mode === '2P' &&
        regionIndex ===
          getRegion(
            G.players[0].group.translation.x,
            G.players[1].group.translation.y
          )
      ) {
        // Don't generate bits in each player's region
        // TODO: Think about generating the bit in the middle of both players
        // not sure if this will make the gameplay better or worse...
      } else if (leanRegions.length > 1) {
        leanRegions.splice(regionIndex, 1);
        regionIndex = leanRegions[getRandomInt(0, leanRegions.length - 1)];
      } else {
        generateBit(true);
        return;
      }
    }
  }
  regionIndex = getRandomInt(0, regions.length - 1);
  const randomRegion = regions[regionIndex];
  // console.log(min, leanRegions, randRegionIndex, randomRegion);
  group.translation.set(
    getRandomInt(randomRegion.minX, randomRegion.maxX),
    getRandomInt(randomRegion.minY, randomRegion.maxY)
  );
  G.bit = {
    group: group,
    direction: null,
    type: type,
    timeLeft: 10,
    regionIndex: regionIndex,
    updateText: function updateText() {
      if (G.bit.timeText) {
        two.remove(G.bit.timeText);
      }
      // create text
      const { x, y } = this.group.translation;
      G.bit.timeText = two.makeText(this.timeLeft, x + 8, y - 8, {
        fill: 'white',
        family: 'Press Start 2P',
        size: 8
      });
    },
    remove: function removeBit() {
      two.remove(this.timeText);
      two.remove(this.group);
      G.prevBitRegion = G.bit.regionIndex;
      G.bit = null;
    },
    move: function move() {
      // Tries to make bit go in a random direction but if it finds self colliding with other things
      // just make it move in the opposite direction
      // TODO: Opposite direction might not seem so nice because one of the appealing things before
      // was for bit to be able to get itself out of sticky situations
      // Best would still be to design algo where it was possible for both players to always reach the bit
      const direction = [upVec, downVec, leftVec, rightVec];
      let idx = getRandomInt(0, direction.length - 1);
      let choice = direction[idx];
      // 50% chance to go same direction
      if (G.bit.direction && getRandomInt(0, 1) === 0) {
        choice = G.bit.direction;
      }
      let newVec = G.bit.group.translation.clone();
      newVec.addSelf(choice);
      G.bit.group.translation.addSelf(choice);
      G.bit.direction = choice;
      const collision = checkCollision(G.bit);
      if (collision.didCollide) {
        G.bit.group.translation.subSelf(choice);
        G.bit.group.translation.addSelf(collision.oppositeDir);
        G.bit.direction = collision.oppositeDir;
      }
      G.bit.updateText();
    },
    getHitbox: function getHitbox() {
      return this.group._collection[0].getBoundingClientRect();
    }
  };
  G.bit.move();

  if (checkCollision(G.bit).didCollide) {
    // Generate bit at random position until it doesn't collide with anything
    generateBit(true);
  } else if (type === 'shield') {
    playShieldSpawnSound();
  } else {
    playBitSpawnSound();
  }
}

export { generateBit };
