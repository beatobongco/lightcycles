let start = null;
let roundTime = 30;
let timeLeft = 0;

const createTimer = _ => {
  timeLeft = roundTime;
  document.getElementById('timer').innerText = roundTime;
  start = Date.now();
  return setInterval(function() {
    const delta = Date.now() - start;
    const timer = document.getElementById('timer');
    timeLeft = roundTime - Math.floor(delta / 1000);
    timer.innerText = timeLeft;
    if (timeLeft <= 0) {
      gameOver = true;
      clearInterval(gameTimer);
    }
    if (timeLeft <= 5 && !timer.classList.contains('time-low')) {
      // play sound sound and turn red
      timer.classList.add('time-low');
    }
  }, 1000);
};

let gameTimer = null;
