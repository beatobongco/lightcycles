let start = null;
let roundTime = 30;
let timeLeft = 0;

const createTimer = _ => {
  timeLeft = roundTime;
  document.getElementById('timer').innerText = roundTime;
  start = Date.now();
  return setInterval(function() {
    const delta = Date.now() - start;
    timeLeft = roundTime - Math.floor(delta / 1000);
    document.getElementById('timer').innerText = timeLeft;
    if (timeLeft <= 0) {
      gameOver = true;
      clearInterval(gameTimer);
    }
  }, 1000);
};

let gameTimer = null;
