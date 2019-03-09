import {
  stageHeight,
  stageWidth,
  two,
  upVec,
  downVec,
  leftVec,
  rightVec
} from './constants';
import { getRandomInt } from './util';
import { checkCollision } from './collisions';
import { playBitSpawnSound, playShieldSpawnSound } from './sound';

function rollBitDirection() {
  const direction = [upVec, downVec, leftVec, rightVec];
  let idx = getRandomInt(0, direction.length - 1);
  let choice = direction.splice(idx, 1)[0];
  let newVec = G.bit.group.translation.clone();
  newVec.addSelf(choice);
  G.bit.group.translation.addSelf(choice);
  G.bit.direction = choice;
  const collision = checkCollision(
    G.bit.group._collection[1].getBoundingClientRect()
  );
  if (collision.didCollide) {
    G.bit.group.translation.subSelf(choice);
    G.bit.group.translation.addSelf(collision.oppositeDir);
    G.bit.direction = collision.oppositeDir;
  }
}

function generateBit(sameAsLast) {
  // Generates a little guy you can get for points
  // every 5 seconds 20% chance to spawn shield bit
  let type = 'normal';
  if (sameAsLast) {
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
  group.translation.set(
    getRandomInt(0, stageWidth),
    getRandomInt(0, stageHeight)
  );
  G.bit = {
    group: group,
    direction: null,
    type: type,
    timeLeft: 10,
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
      G.bit = null;
    },
    move: function move() {
      const chance = getRandomInt(0, 1);

      // if (!this.direction || chance === 0) {
      // }
      rollBitDirection();
      G.bit.updateText();
    }
  };
  G.bit.updateText();

  if (checkCollision(G.bit.group.getBoundingClientRect()).didCollide) {
    // Generate bit at random position until it doesn't collide with anything
    generateBit();
  } else if (type === 'shield') {
    playShieldSpawnSound();
  } else {
    playBitSpawnSound();
  }
}

export { generateBit };
