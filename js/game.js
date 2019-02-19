const maxSpeed = 6;
const decelerationTime = 3;
const accelerationTime = [3, 4, 6, 14, 16];
const brakeTime = 3;
const playerSize = 6;
// I have changed the hitbox size so much, but 5 seems like a real jackpot
// Large enough so you won't phase through walls but small enough to stick
// really close to lighttrails for some really interesting plays!
const hitboxSize = 5;
const speedPerTick = 1;
const leftVec = new Two.Vector(-speedPerTick, 0);
const rightVec = new Two.Vector(speedPerTick, 0);
const upVec = new Two.Vector(0, -speedPerTick);
const downVec = new Two.Vector(0, speedPerTick);
let numPlayers = 2;
let user = null;
let enemy = null;
let players = initPlayers(numPlayers);

// Initial draw of grid and players
two.update();

let gameOver = true;
let gameOverText = null;

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

  const slipstream = checkCollision(player, -3);
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

const gameInst = two.bind('update', frameCount => {
  stats.begin();
  if (!gameOver) {
    const dirs = [];
    for (let i = 0; i < players.length; i++) {
      dirs.push(generateMove(players[i], frameCount));
    }
    for (let i = 0; i < players.length; i++) {
      checkPlayerCollision(players[i], dirs[i]);
      if (!players[i].alive) {
        gameOver = true;
      }
    }
  } else {
    clearInterval(gameTimer);

    let subtext = 'Press `R` to play next round.';

    // If all players are dead, it's a draw
    if (players.every(p => !p.alive)) {
      gameOverText = 'DRAW';
    } else if (timeLeft <= 0) {
      // If timer is up, base it on score
      gameOverText = 'TIME UP';
      let winner = null;
      let score = 0;
      players.forEach(p => {
        if (p.score > score) {
          winner = p;
        } else if (p.score === score) {
          winner = null;
        }
      });
      if (winner) {
        winner.roundWins += 1;
        subtext = `${winner.name} WINS <p>${
          winner.name
        } has a longer jetwall. </p> <p>${subtext} </p>`;
      } else {
        subtext = `DRAW. <p>${subtext} </p>`;
      }
    } else {
      // If 1 player alive show his win
      players.some(p => {
        if (p.alive) {
          gameOverText = `${p.name} WINS`;
          p.roundWins += 1;
          return true;
        }
      });
    }

    document.getElementById('gameOverSubtext').innerHTML = subtext;

    players.some(p => {
      if (p.roundWins === 3) {
        p.wins += 1;
        gameOverText = `${p.name} WINS THE MATCH`;
        document.getElementById(
          'gameOverSubtext'
        ).innerText = `Press \`R\` for rematch.`;
        return true;
      }
    });
    document.getElementById('gameOverContainer').style.display = 'flex';
    document.getElementById('gameOverText').innerText = gameOverText;
    stopPlayerSounds();
    two.pause();
  }
  stats.end();
});
