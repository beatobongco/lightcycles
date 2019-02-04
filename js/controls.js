function playerMove(player, direction) {
  player.direction = direction;
}

function pShift(player, gear) {
  playShiftSound(gear);
  player.speed += gear;
}

function showStats() {
  document.getElementById('fps').style.display = 'block';
}

document.body.onkeydown = k => {
  if (k.code === 'KeyG') {
    if (!gameInst.playing) {
      gameInst.play();
      document.getElementById('gameOverContainer').style.display = 'none';
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
  }
  if (!gameOver) {
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
      case 'KeyT':
        if (user.speed < 3) {
          pShift(user, 1);
        }
        playBikeSound(user);
        break;
      case 'KeyY':
        if (user.speed > 1) {
          pShift(user, -1);
        }
        playBikeSound(user);
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
      case 'BracketRight':
        if (enemy.speed < 3) {
          pShift(enemy, 1);
        }
        playBikeSound(enemy);
        break;
      case 'BracketLeft':
        if (enemy.speed > 1) {
          pShift(enemy, -1);
        }
        playBikeSound(enemy);
        break;
    }
  } else if (k.code === 'KeyR') {
    if (players.some(p => !p.alive)) {
      players.forEach(p => {
        two.remove(p.group);
        two.remove(p.corpse);
        p.lightTrails.forEach(l => {
          two.remove(l);
        });
      });
      user = initUser(user.wins);
      enemy = initEnemy(enemy.wins);
      players = [user, enemy];
      userHud.setPlayer(user);
      enemyHud.setPlayer(enemy);
      gameOver = false;
      initPlayerSounds();
      document.getElementById('gameOverContainer').style.display = 'none';
      two.update();
    }
  }
};
