const sounds = [
  'sound/speed1.mp3',
  'sound/speed2.mp3',
  'sound/speed3.mp3',
  'sound/shiftup.mp3',
  'sound/shiftdown.mp3',
  'sound/derezz.mp3'
];

sounds.forEach(s => {
  var _sound = new Audio(s);
  _sound.addEventListener('canplaythrough', () => {
    console.log(s, 'loaded');
  });
});

function initPlayerSounds() {
  players.forEach(player => {
    player.sound.src = `sound/speed${player.speed}.mp3`;
    player.sound.loop = true;
    player.sound.play();
  });
}

function stopPlayerSounds() {
  players.forEach(player => {
    player.sound.pause();
  });
}

function playBikeSound(player) {
  var newSrc = `sound/speed${player.speed}.mp3`;
  var src = player.sound.src.split('/');
  var lastTwo = src.slice(src.length - 2, src.length);
  if (!(newSrc === lastTwo.join('/'))) {
    player.sound.src = newSrc;
    player.sound.play();
  }
}

function playShiftSound(gear) {
  var shiftSound = new Audio('sound/shiftdown.mp3');
  if (gear > 0) {
    shiftSound.src = 'sound/shiftup.mp3';
  }
  shiftSound.play();
}

function playDerezzSound() {
  var derezz = new Audio('sound/derezz.mp3');
  derezz.play();
}

initPlayerSounds();
