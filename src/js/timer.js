import { playTick } from './sound';

let start = null;

const createTimer = () => {
  clearInterval(G.gameTimer);
  G.timeLeft = G.roundTime;
  document.getElementById('timer').classList.remove('time-low');
  document.getElementById('timer').innerText = G.roundTime;
  start = Date.now();
  return setInterval(function() {
    const delta = Date.now() - start;
    const timer = document.getElementById('timer');
    G.timeLeft = G.roundTime - Math.floor(delta / 1000);
    timer.innerText = G.timeLeft;
    if (G.timeLeft <= 0) {
      G.gameOver = true;
      clearInterval(G.gameTimer);
    }
    const tc = timer.classList;
    if (G.timeLeft <= 5) {
      if (!tc.contains('time-low')) {
        tc.add('time-low');
      }
      playTick();
    } else if (tc.contains('time-low')) {
      tc.remove('time-low');
    }
  }, 1000);
};

function addTime(s) {
  start += s * 1000;
}

function setTime(s) {
  start = Date.now();
  G.timeLeft = s;
}

export { createTimer, addTime, setTime };
