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
  hitboxSize,
  scoreKey
} from './constants';
import initGrid from './grid';
import { checkCollision } from './collisions';
import {
  playDerezzSound,
  playBikeSound,
  stopPlayerSounds,
  playBitSpawnSound,
  loadSounds
} from './sound';
import { getOppositeDirection, createShards, getRandomInt } from './util';
import initControls from './controls';
import { createPlayerCircle, generateBit } from './players';
import { setTime } from './timer';

loadSounds();
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

  const slipstream = checkCollision(
    player.group._collection[0].getBoundingClientRect(),
    player,
    0,
    true
  );
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

  for (let i = 1; i <= player.speed + bonus; i++) {
    if (G.mode === '2P') {
      player.score += 1;
    }
    if (player.direction !== player.prevDirection) {
      // set a new origin for the light trail
      player.currentOrigin = player.group.translation.clone();
      player.prevDirection = player.direction;
      player.lastMoveFrame = frameCount;
      // reset sound when turning
      player.sound.currentTime = 0;
    }

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
    const collision = checkCollision(
      player.group._collection[1].getBoundingClientRect(),
      player,
      hitboxSize / 2
    );
    if (collision.didCollide) {
      playDerezzSound();
      player.alive = false;
      two.remove(player.group);
      const { oppX, oppY } = getOppositeDirection(player.direction);
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
      return;
    } else if (collision.obtainedBit) {
      player.score += 250;
      // TODO: Make bit move around after certain thresholds
      setTime(Math.max(10 - Math.floor(player.score / 1000), 5));
      playBitSpawnSound();
      generateBit();
    }
  }
  playBikeSound(player, bonus);

  if (G.toggleTrails) {
    createLightTrail(player);
  } else if (player.isAccelerating) {
    createLightTrail(player);
  } else {
    player.currentOrigin = player.group.translation.clone();
  }

  two.remove(player.sparks);
  if (slipstream.didCollide) {
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

G.instance = two.bind('update', frameCount => {
  stats.begin();
  if (!G.gameOver) {
    for (let i = 0; i < G.players.length; i++) {
      generateMove(G.players[i], frameCount);
    }
    for (let i = 0; i < G.players.length; i++) {
      if (!G.players[i].alive) {
        G.gameOver = true;
      }
    }
  } else {
    clearInterval(G.gameTimer.id);

    let subtext = 'Press `R` to play next round.';
    if (G.mode === '1P') {
      let score = G.players[0].score;
      let hiscore = localStorage.getItem(scoreKey) || 0;
      if (score > hiscore) {
        localStorage.setItem(scoreKey, score);
        subtext = `You set a new record, ${score} pts!`;
      } else {
        subtext = `You got ${score} pts!`;
      }
      subtext += '<p>Press `R` to try again. </p>';
    }
    // If all players are dead, it's a draw
    if (G.players.every(p => !p.alive)) {
      if (G.mode === '2P') {
        G.gameOverText = 'DRAW';
      } else {
        G.gameOverText = 'YOU DEREZZED';
      }
    } else if (G.gameTimer.timeLeft <= 0) {
      // If timer is up, base it on score
      G.gameOverText = 'TIME UP';

      if (G.mode === '2P') {
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
