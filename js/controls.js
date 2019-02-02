function playerMove(player, direction) {
  // dont allow movements in opposite directions
  if (
    (direction === 'down' && player.direction !== 'up') ||
    (direction === 'up' && player.direction !== 'down') ||
    (direction === 'right' && player.direction !== 'left') ||
    (direction === 'left' && player.direction !== 'right')
  ) {
    player.direction = direction;
  }
}

document.body.onkeydown = k => {
  switch (k.code) {
    case 'KeyR':
      reset();
      break;
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
    case 'KeyG':
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
};
