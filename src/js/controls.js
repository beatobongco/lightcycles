function playerMove(player, direction) {
  // dont allow movements in opposite directions
  if (
    (direction === 'down' && player.prevDirection !== 'up') ||
    (direction === 'up' && player.prevDirection !== 'down') ||
    (direction === 'right' && player.prevDirection !== 'left') ||
    (direction === 'left' && player.prevDirection !== 'right')
  ) {
    player.direction = direction;
  }
}

function pBrake(player) {
  if (!player.isBraking) {
    playShiftSound(-1);
  }
  player.isBraking = true;
}

function pAccelerate(player) {
  if (!player.isAccelerating) {
    playShiftSound(1);
  }
  player.isAccelerating = true;
}

const userKeyAcc = 'KeyT';
const userKeyBrake = null;

const enemyKeyAcc = 'BracketRight';
const enemyKeyBrake = null;

document.body.onkeyup = k => {
  switch (k.code) {
    case userKeyAcc:
      user.isAccelerating = false;
      break;
    case userKeyBrake:
      user.isBraking = false;
      break;
    case enemyKeyAcc:
      enemy.isAccelerating = false;
      break;
    case enemyKeyBrake:
      enemy.isBraking = false;
      break;
  }
};

function startGame() {
  gameOverText = null;
  gameTimer = createTimer();
  gameOver = false;
  document.getElementById('gameOverContainer').style.display = 'none';
  if (!players || players.some(p => p.roundWins === 3)) {
    players = initPlayers();
  } else {
    // init players, carrying over wins
    players = initPlayers(true);
  }
  initPlayerSounds();

  if (noPlayer) {
    generateBit();
  }
  gameInst.play();
}
let firstRun = true;
document.body.onkeydown = k => {
  if (k.code === 'KeyR') {
    const docElem = document.documentElement;
    if (docElem.requestFullscreen) {
      docElem.requestFullscreen();
    } else if (docElem.mozRequestFullScreen) {
      /* Firefox */
      docElem.mozRequestFullScreen();
    } else if (docElem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      docElem.webkitRequestFullscreen();
    } else if (docElem.msRequestFullscreen) {
      /* IE/Edge */
      docElem.msRequestFullscreen();
    }
    if (firstRun) {
      firstRun = false;
      startGame();
    } else if (gameOver) {
      document.getElementById('timer').classList.remove('time-low');
      players.forEach(p => {
        two.remove(p.group);
        two.remove(p.corpse);
        two.remove(p.sparks);
        p.lightTrails.forEach(l => {
          two.remove(l);
        });
      });

      startGame();
    }
  } else if (k.code === 'Pause' && pauseEnabled) {
    if (gameInst.playing) {
      gameInst.pause();
    } else {
      gameInst.play();
    }
  } else if (!gameOver) {
    switch (k.code) {
      // user controls
      case 'KeyS':
        playerMove(user, 'down');
        break;
      case 'KeyW':
        playerMove(user, 'up');
        break;
      case 'KeyA':
        playerMove(user, 'left');
        break;
      case 'KeyD':
        playerMove(user, 'right');
        break;
      case userKeyAcc:
        pAccelerate(user);
        break;
      case userKeyBrake:
        pBrake(user);
        break;
      // enemy controls
      case 'ArrowDown':
        playerMove(enemy, 'down');
        break;
      case 'ArrowUp':
        playerMove(enemy, 'up');
        break;
      case 'ArrowLeft':
        playerMove(enemy, 'left');
        break;
      case 'ArrowRight':
        playerMove(enemy, 'right');
        break;
      case enemyKeyAcc:
        pAccelerate(enemy);
        break;
      case enemyKeyBrake:
        pBrake(enemy);
        break;
    }
  }
};
