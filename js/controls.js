function playerMove(player, direction) {
  player.direction = direction;
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

let firstRun = true;
document.body.onkeydown = k => {
  if (k.code === 'KeyG') {
    if (firstRun) {
      firstRun = false;
      gameOver = false;
      gameInst.play();
      document.getElementById('gameOverContainer').style.display = 'none';
      document.getElementById('tips-container').style.display = 'none';
      initPlayerSounds();
    }
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
  } else if (k.code === 'KeyR' && gameOver) {
    players.forEach(p => {
      two.remove(p.group);
      two.remove(p.corpse);
      p.lightTrails.forEach(l => {
        two.remove(l);
      });
    });
    if (players.some(p => p.wins === 3)) {
      user = initUser(0);
      enemy = initEnemy(0);
    } else {
      user = initUser(user.wins);
      enemy = initEnemy(enemy.wins);
    }
    players = [user, enemy];
    if (noEnemy) {
      players = [user];
    }
    gameOver = false;
    initPlayerSounds();
    document.getElementById('gameOverContainer').style.display = 'none';
    document.getElementById('tips-container').style.display = 'none';
    two.play();
  }
};
