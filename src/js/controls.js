import { createTimer } from './timer';
import { initPlayers } from './players';
import { generateBit } from './bit';
import { two } from './constants';
import {
  initPlayerSounds,
  playAccelerateSound,
  stopPlayerSounds,
  playJoinSound,
  playRezzinSound
} from './sound';
import { regions } from './grid';

const userKeyAcc = 'KeyT';
const enemyKeyAcc = 'BracketRight';
const altEnemyKeyAcc = 'Numpad1';

function playerMove(player, direction) {
  const d = player.directionBuffer;
  if (d.length === 2) {
    d.shift();
  }
  d.push(direction);
}

function pAccelerate(player) {
  if (!player.isAccelerating) {
    playAccelerateSound(1);
  }
  player.isAccelerating = true;
}

function playerJoin() {
  playJoinSound();
  G.firstRun = true;
  G.noPlayer = null;
  G.mode = '2P';
  G.roundTime = 30;
  startGame();
}

function startGame() {
  document.getElementsByClassName('controls')[0].style.display = 'none';
  two.pause();
  regions.forEach(r => {
    r.lightTrails.forEach(l => {
      two.remove(l);
    });
    r.lightTrails = [];
  });
  if (G.players.length > 0) {
    G.players.forEach(p => {
      two.remove(p.group);
      p.corpses.forEach(c => {
        two.remove(c);
      });
      two.remove(p.sparks);
    });
    stopPlayerSounds();
  }
  if (G.bit) {
    G.bit.remove();
  }
  G.gameOverText = null;
  G.gameOver = false;
  document.getElementById('gameOverContainer').style.display = 'none';
  if (!G.players || G.players.some(p => p.roundWins === 3)) {
    initPlayers();
  } else {
    // init players, carrying over wins
    initPlayers(true);
  }
  two.update(); // to draw
  stopPlayerSounds();

  playRezzinSound();
  createTimer(3, timeLeft => {
    if (timeLeft <= 0) {
      createTimer(G.roundTime, timeLeft => {
        // show smaller timer near bit
        if (G.bit) {
          G.bit.timeLeft -= 1;
          G.bit.updateText();
        }

        if (timeLeft <= 0) {
          G.gameOver = true;
        } else if (timeLeft % 5 === 0 && !G.bit) {
          generateBit();
        } else if (G.bit && G.bit.timeLeft <= 0) {
          // after 10 seconds bit will try to spawn elsewhere
          generateBit(true);
        }
      });
      generateBit();
      initPlayerSounds();
      G.instance.play();
    }
  });
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
      if (G.gameOver) {
        startGame();
      }
    } else if ((k.code === 'Pause' || k.code === 'KeyP') && G.pauseEnabled) {
      if (G.instance.playing) {
        G.instance.pause();
      } else {
        G.instance.play();
      }
    } else if (
      (!G.enemy && k.code === 'ArrowUp') ||
      (!G.user && k.code === 'KeyW')
    ) {
      playerJoin();
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
          case altEnemyKeyAcc:
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
        case altEnemyKeyAcc:
          if (G.enemy) {
            G.enemy.isAccelerating = false;
          }
          break;
      }
    }
  };
}

export default initControls;
