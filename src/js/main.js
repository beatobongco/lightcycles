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
  scoreKey,
  stageWidth,
  stageHeight,
  lightTrailWidth
} from './constants';
import initGrid from './grid';
import {
  checkPlayerCollision,
  checkLightTrailCollision,
  checkCollision
} from './collisions';
import {
  playDerezzSound,
  playBikeSound,
  stopPlayerSounds,
  loadSounds,
  playBitSpawnSound,
  playShieldPickupSound
} from './sound';
import { getOppositeDirection, createShards, getRandomInt } from './util';
import initControls from './controls';
import { createPlayerCircle, generateBit } from './players';
import { addTime } from './timer';

loadSounds();
initGrid();
initControls();

function checkMoveLegal(newDirection, player) {
  if (
    ((newDirection === 'up' || newDirection === 'down') &&
      (player.direction === 'up' || player.direction === 'down')) ||
    ((newDirection === 'left' || newDirection === 'right') &&
      (player.direction === 'left' || player.direction === 'right'))
  ) {
    return false;
  }
  return true;
}

function createLightTrail(player) {
  // TODO: find a way to fill in the line without causing crashes
  // due to excess hitbox
  // const { oppX, oppY } = getOppositeDirection(player.direction);
  const lightTrail = two.makeLine(
    player.currentOrigin.x, //+ oppX * fillWidth,
    player.currentOrigin.y, //+ oppY * fillWidth,
    player.group.translation.x,
    player.group.translation.y
  );
  lightTrail.stroke = player.strokeColor;
  lightTrail.linewidth = lightTrailWidth;
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

  // Might be able to make deceleration more responsive by putting everything inside a while loop

  const slipstream = checkLightTrailCollision(player, true);

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

  const trn = player.group.translation;
  // EXPLANATION FOR COOLDOWN:
  // If you draw hitbox of size 4 and lighttrail of width 6, it takes 4 units of distance
  // to visually clear the lighttrail's path if going for a U-turn
  const cooldown = playerSize / 2 + 1;

  let usedShield = false;

  player.score += Math.ceil((player.speed + bonus) / 2);

  for (let i = 0; i < player.speed + bonus; i++) {
    // If not on cooldown and move is legal, apply the buffer
    if (player.directionBuffer.length > 0 && player.lastMoveDist > cooldown) {
      const direction = player.directionBuffer.shift();
      if (checkMoveLegal(direction, player)) {
        player.direction = direction;
        player.lastMoveDist = 0;
        // set a new origin for the light trail
        player.currentOrigin = player.group.translation.clone();
        // reset sound when turning
        player.sound.currentTime = 0;
      }
    }

    player.lastMoveDist += 1;

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
    const collision = checkPlayerCollision(player);
    if (collision.didCollide) {
      playDerezzSound();
      player.alive = false;
      two.remove(player.group);
      const { oppX, oppY } = getOppositeDirection(player.direction);
      player.corpses.push(
        createShards(
          player.group.translation,
          player.originalFill,
          oppX,
          oppY,
          getRandomInt(3, 3 * player.speed),
          playerSize * player.speed * (player.speed / 2),
          2,
          3
        )
      );
      return;
    } else if (collision.obtainedBit) {
      if (G.bit.type === 'shield') {
        playShieldPickupSound();
      } else {
        playBitSpawnSound();
      }
      if (G.bit.type === 'shield') {
        player.hasShield = true;
        player.fillColor = '#0652DD';
      }
      player.score += 1000;
      two.remove(G.bit.group);
      G.bit = null;
      if (G.mode === '1P') {
        addTime(5);
        generateBit();
      }
    }
    if (collision.usedShield) {
      usedShield = true;
    }
  }

  if (usedShield) {
    player.hasShield = false;
    player.fillColor = player.originalFill;
  }
  playBikeSound(player, bonus);

  if (!G.toggleTrails) {
    createLightTrail(player);
  } else if (player.isAccelerating) {
    createLightTrail(player);
  } else {
    player.currentOrigin = player.group.translation.clone();
  }

  two.remove(player.sparks);
  if (slipstream.didCollide) {
    // We create sparks here at the bottom because we need to know the current direction
    // https://codepen.io/anon/pen/wNRegz
    const base = 1 + player.speed;
    const { x, y } = slipstream.oppositeDir || { x: 0, y: 0 };
    const { oppX, oppY } = getOppositeDirection(player.direction);
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
}

function rollBitDirection() {
  const direction = [upVec, downVec, leftVec, rightVec][getRandomInt(0, 3)];
  G.bit.direction = direction;
}

function checkBitMoveLegal() {
  const newVec = G.bit.group.translation.clone();
  newVec.addSelf(G.bit.direction);
  // TODO: removed padding for now since it causes hangs
  // Add back when bit spawning has padding too
  if (
    newVec.x > stageWidth - 0 ||
    newVec.x < 0 ||
    newVec.y > stageHeight - 0 ||
    newVec.y < 0
  ) {
    return false;
  }
  return true;
}

G.instance = two.bind('update', frameCount => {
  stats.begin();
  if (!G.gameOver) {
    for (let i = 0; i < G.players.length; i++) {
      const player = G.players[i];
      generateMove(player, frameCount);
    }
    if (G.bit) {
      // const player = G.players[0];
      // player.score / 2000
      const chance = getRandomInt(0, 1);

      if (!G.bit.direction || chance === 0 || !checkBitMoveLegal()) {
        rollBitDirection();
      }

      // Try dislodging bit up to 4 times (a while loop would make game hang in certain cases)
      for (let i = 0; i < 4; i++) {
        if (
          checkCollision(G.bit.group._collection[0].getBoundingClientRect())
            .didCollide
        ) {
          rollBitDirection();
        } else {
          break;
        }
      }
      G.bit.group.translation.addSelf(G.bit.direction);
    }
    for (let i = 0; i < G.players.length; i++) {
      if (!G.players[i].alive) {
        G.gameOver = true;
      }
    }
  } else {
    document.getElementsByClassName('controls')[0].style.display = 'block';
    clearInterval(G.gameTimer.id);

    let subtext = 'Press `R` to play next round.';
    if (G.mode === '1P') {
      const player = G.players[0];
      if (!player.alive) {
        G.gameOverText = 'YOU DEREZZED';
      } else if (G.gameTimer.timeLeft <= 0) {
        G.gameOverText = 'TIME UP!';
      }
      let score = player.score;
      let hiscore = localStorage.getItem(scoreKey) || 0;
      if (score > hiscore) {
        localStorage.setItem(scoreKey, score);
        subtext = `You set a new record, ${score} pts!`;
      } else {
        subtext = `You got ${score} pts!`;
      }
      subtext += '<p>Press `R` to try again. </p>';
    } else if (G.mode === '2P') {
      // If all players are dead, it's a draw
      if (G.players.every(p => !p.alive)) {
        G.gameOverText = 'DRAW';
      } else if (G.gameTimer.timeLeft <= 0) {
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
          pointsText += `<p> ${winner.name} WINS </p>`;
        } else {
          pointsText = `<p>DRAW.</p>`;
        }
        subtext = `${pointsText} ${subtext}`;
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
