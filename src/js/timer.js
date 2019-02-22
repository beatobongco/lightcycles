import { playTick } from './sound';

let start = null;

function setTimerColor() {
  const timer = document.getElementById('timer');
  const tc = timer.classList;
  if (G.timeLeft <= 5) {
    if (!tc.contains('time-low')) {
      tc.add('time-low');
    }
    playTick();
  } else if (tc.contains('time-low')) {
    tc.remove('time-low');
  }
}
const createTimer = (time, callback) => {
  clearInterval(G.gameTimer);
  G.timeLeft = time;
  document.getElementById('timer').classList.remove('time-low');
  document.getElementById('timer').innerText = time;
  start = Date.now();
  setTimerColor();
  return setInterval(function() {
    const delta = Date.now() - start;
    const timer = document.getElementById('timer');
    G.timeLeft = time - Math.floor(delta / 1000);
    timer.innerText = G.timeLeft;
    if (G.timeLeft <= 0 && callback) {
      callback();
      clearInterval(G.gameTimer);
    }
    setTimerColor();
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
