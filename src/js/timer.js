import { playTick } from './sound';

let start = null;
let roundTime = 30;

const createTimer = _ => {
  G.timeLeft = roundTime;
  document.getElementById('timer').innerText = roundTime;
  start = Date.now();
  return setInterval(function() {
    const delta = Date.now() - start;
    const timer = document.getElementById('timer');
    G.timeLeft = roundTime - Math.floor(delta / 1000);
    timer.innerText = G.timeLeft;
    if (G.timeLeft <= 0) {
      G.gameOver = true;
      clearInterval(G.gameTimer);
    }
    if (G.timeLeft <= 5) {
      if (!timer.classList.contains('time-low')) {
        timer.classList.add('time-low');
      }
      playTick();
    }
  }, 1000);
};

export { createTimer };
