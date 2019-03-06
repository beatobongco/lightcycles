import { createTimer } from './timer';
import { initPlayers, generateBit } from './players';
import { two } from './constants';
import {
  initPlayerSounds,
  playAccelerateSound,
  stopPlayerSounds,
  playJoinSound,
  playRezzinSound
} from './sound';

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
  if (G.players.length > 0) {
    G.players.forEach(p => {
      two.remove(p.group);
      p.corpses.forEach(c => {
        two.remove(c);
      });
      two.remove(p.sparks);
      p.lightTrails.forEach(l => {
        two.remove(l);
      });
    });
    stopPlayerSounds();
  }
  if (G.bit) {
    two.remove(G.bit.group);
    G.bit = null;
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
  createTimer(3, () => {
    createTimer(G.roundTime, () => {
      G.gameOver = true;
    });
    // if (G.noPlayer) {
    generateBit();
    // }
    initPlayerSounds();
    G.instance.play();
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
    } else if (k.code === 'Pause' && G.pauseEnabled) {
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
