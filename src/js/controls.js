import { createTimer } from './timer';
import { initPlayers, generateBit } from './players';
import { two } from './constants';
import { initPlayerSounds, playAccelerateSound } from './sound';

const userKeyAcc = 'KeyT';
const enemyKeyAcc = 'BracketRight';

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

function pAccelerate(player) {
  if (!player.isAccelerating) {
    playAccelerateSound(1);
  }
  player.isAccelerating = true;
}

function startGame() {
  G.gameOverText = null;
  G.gameTimer = createTimer();
  G.gameOver = false;
  document.getElementById('gameOverContainer').style.display = 'none';
  if (!G.players || G.players.some(p => p.roundWins === 3)) {
    initPlayers();
  } else {
    // init players, carrying over wins
    initPlayers(true);
  }
  initPlayerSounds();

  if (G.noPlayer) {
    generateBit();
  }
  G.instance.play();
}

function initControls() {
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
      if (G.firstRun) {
        G.firstRun = false;
        startGame();
      } else if (G.gameOver) {
        document.getElementById('timer').classList.remove('time-low');
        G.players.forEach(p => {
          two.remove(p.group);
          two.remove(p.corpse);
          two.remove(p.sparks);
          p.lightTrails.forEach(l => {
            two.remove(l);
          });
        });

        startGame();
      }
    } else if (k.code === 'Pause' && G.pauseEnabled) {
      if (G.instance.playing) {
        G.instance.pause();
      } else {
        G.instance.play();
      }
    } else if (!G.gameOver) {
      if (G.user) {
        switch (k.code) {
          // user controls
          case 'KeyS':
            playerMove(G.user, 'down');
            break;
          case 'KeyW':
            playerMove(G.user, 'up');
            break;
          case 'KeyA':
            playerMove(G.user, 'left');
            break;
          case 'KeyD':
            playerMove(G.user, 'right');
            break;
          case userKeyAcc:
            pAccelerate(G.user);
            break;
        }
      }

      if (G.enemy) {
        switch (k.code) {
          // enemy controls
          case 'ArrowDown':
            playerMove(G.enemy, 'down');
            break;
          case 'ArrowUp':
            playerMove(G.enemy, 'up');
            break;
          case 'ArrowLeft':
            playerMove(G.enemy, 'left');
            break;
          case 'ArrowRight':
            playerMove(G.enemy, 'right');
            break;
          case enemyKeyAcc:
            pAccelerate(G.enemy);
            break;
        }
      }
    }
  };
  document.body.onkeyup = k => {
    if (!G.gameOver) {
      switch (k.code) {
        case userKeyAcc:
          if (G.user) {
            G.user.isAccelerating = false;
          }
          break;
        case enemyKeyAcc:
          if (G.enemy) {
            G.enemy.isAccelerating = false;
          }
          break;
      }
    }
  };
}

export default initControls;
