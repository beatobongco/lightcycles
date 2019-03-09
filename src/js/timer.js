import { playTick } from './sound';

function setTimerColor() {
  const timer = document.getElementById('timer');
  const tc = timer.classList;
  if (G.gameTimer.timeLeft <= 5) {
    if (!tc.contains('time-low')) {
      tc.add('time-low');
    }
    playTick();
  } else if (tc.contains('time-low')) {
    tc.remove('time-low');
  }
}

const createTimer = (time, callback) => {
  clearInterval(G.gameTimer.id);
  const newTimer = {
    id: null,
    start: null,
    timeLeft: null,
    totalTime: time
  };
  G.gameTimer = newTimer;
  G.gameTimer.timeLeft = time;
  document.getElementById('timer').classList.remove('time-low');
  document.getElementById('timer').innerText = time;
  G.gameTimer.start = Date.now();
  setTimerColor();
  G.gameTimer.id = setInterval(() => {
    const delta = Date.now() - G.gameTimer.start;
    const timer = document.getElementById('timer');
    G.gameTimer.timeLeft = G.gameTimer.totalTime - Math.floor(delta / 1000);
    timer.innerText = G.gameTimer.timeLeft;
    callback(G.gameTimer.timeLeft);
    setTimerColor();
  }, 1000);
};

function setTime(s) {
  G.gameTimer.start = Date.now();
  G.gameTimer.totalTime = s;
  G.gameTimer.timeLeft = s;
  document.getElementById('timer').innerText = s;
  setTimerColor();
}

function addTime(s) {
  G.gameTimer.totalTime += s;
  G.gameTimer.timeLeft += s;
  // document.getElementById('timer').innerText = s;
  // setTimerColor();
}

export { createTimer, setTime, addTime };
