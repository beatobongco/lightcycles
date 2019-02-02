function playerMove(player, direction) {
  player.direction = direction;
}

document.body.onkeydown = k => {
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
          user.speed += 1;
        }
        break;
      case 'KeyY':
        if (user.speed > 1) {
          user.speed -= 1;
        }
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
          enemy.speed += 1;
        }
        break;
      case 'BracketLeft':
        if (enemy.speed > 1) {
          enemy.speed -= 1;
        }
        break;
    }
  } else if (k.code === 'KeyR') {
    if (players.some(p => !p.alive)) {
      players.forEach(p => {
        two.remove(p.group);
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
      document.getElementById('gameOverText').style.display = 'none';
      two.update();
    }
  }
};
