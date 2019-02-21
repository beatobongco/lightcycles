import {
  upVec,
  leftVec,
  rightVec,
  downVec,
  two,
  accelerationTime,
  decelerationTime,
  maxSpeed,
  playerSize,
  hitboxSize
} from './constants';
import initGrid from './grid';
import { checkPlayerCollision } from './collisions';
import { playBikeSound, stopPlayerSounds } from './sound';
import { getOppositeDirection, createShards, getRandomInt } from './util';
import initControls from './controls';
import { createPlayerCircle, generateBit } from './players';
import { playDerezzSound } from './sound';

initGrid();
initControls();

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

function generateMove(player, frameCount) {
  let bonus = 0;
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

  const slipstream = checkPlayerCollision(player, -3);
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

  let cooldown = Math.round(Math.max(0, 6 / Math.max(1, player.speed + bonus)));
  if (player.speed === maxSpeed) {
    cooldown = 0;
  }
  // only register changes of directions every <cooldown> frames
  let direction = player.direction;
  const trn = player.group.translation;

  for (let i = 0; i < player.speed + bonus; i++) {
    player.score += 1;
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
    if (hitboxSize % (i + 1) === 0) {
      const collision = checkPlayerCollision(player);
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
      } else if (collision.obtainedBit) {
        player.score += 250;
        generateBit();
      }
    }
  }
  playBikeSound(player, bonus);
  createLightTrail(player);
  two.remove(player.sparks);
  if (slipstream.didCollide) {
    // https://codepen.io/anon/pen/wNRegz
    const base = 1 + player.speed;
    const { x, y } = slipstream.oppositeDir || { x: 0, y: 0 };
    const { oppX, oppY } = getOppositeDirection(direction);
    player.sparks = createShards(
      player.group.translation,
      player.sparkColor,
      x + oppX * base,
      y + oppY * base,
      getRandomInt(3, 3 + player.speed),
      1 + Math.round(player.speed * 2),
      2,
      2,
      playerSize / 2
    );
  }
  // Make circle on top of trail
  two.remove(player.group);
  player.group = createPlayerCircle(
    trn.x,
    trn.y,
    player.strokeColor,
    player.fillColor
  );
  return direction;
}

G.instance = two.bind('update', frameCount => {
  stats.begin();
  if (!G.gameOver) {
    const dirs = [];
    for (let i = 0; i < G.players.length; i++) {
      generateMove(G.players[i], frameCount);
    }
    for (let i = 0; i < G.players.length; i++) {
      if (!G.players[i].alive) {
        G.gameOver = true;
      }
    }
  } else {
    clearInterval(G.gameTimer);

    let subtext = 'Press `R` to play next round.';

    // If all players are dead, it's a draw
    if (G.players.every(p => !p.alive)) {
      G.gameOverText = 'DRAW';
    } else if (G.timeLeft <= 0) {
      // If timer is up, base it on score
      G.gameOverText = 'TIME UP';
      let winner = null;
      let score = 0;
      let pointsText = '';
      G.players.forEach(p => {
        pointsText += `<p>${p.name}: ${p.score} pts</p>`;
        if (p.score > score) {
          score = p.score;
          winner = p;
        } else if (p.score === score) {
          winner = null;
        }
      });
      if (winner) {
        winner.roundWins += 1;
        subtext = `${winner.name} WINS <p>${
          winner.name
        } has a longer jetwall. </p>
        ${pointsText}
        <p>${subtext}</p>`;
      } else {
        subtext = `DRAW. <p>${subtext} </p>`;
      }
    } else {
      // If 1 player alive show his win
      G.players.some(p => {
        if (p.alive) {
          G.gameOverText = `${p.name} WINS`;
          p.roundWins += 1;
          return true;
        }
      });
    }

    document.getElementById('gameOverSubtext').innerHTML = subtext;

    G.players.some(p => {
      if (p.roundWins === 3) {
        p.wins += 1;
        G.gameOverText = `${p.name} WINS THE MATCH`;
        document.getElementById(
          'gameOverSubtext'
        ).innerText = `Press \`R\` for rematch.`;
        return true;
      }
    });
    document.getElementById('gameOverContainer').style.display = 'flex';
    document.getElementById('gameOverText').innerText = G.gameOverText;
    stopPlayerSounds();
    two.pause();
  }
  stats.end();
});
