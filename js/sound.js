// Preload sounds, keep them in an object to know if they are loaded
const sounds = {
  'sound/speed1.mp3': false,
  'sound/speed2.mp3': false,
  'sound/speed3.mp3': false,
  'sound/shiftup.mp3': false,
  'sound/shiftdown.mp3': false,
  'sound/derezz.mp3': false
};

Object.keys(sounds).forEach(s => {
  var _sound = new Audio(s);
  _sound.addEventListener('canplaythrough', () => {
    sounds[s] = true;
  });
});

function initPlayerSounds() {
  players.forEach(player => {
    player.sound.src = `sound/speed${player.speed}.mp3`;
    // player.sound.loop = true;
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
  let src = 'sound/shiftdown.mp3';
  if (gear > 0) {
    src = 'sound/shiftup.mp3';
  }
  if (sounds[src]) {
    let shiftSound = new Audio(src);
    shiftSound.play();
  }
}

function playDerezzSound() {
  let src = 'sound/derezz.mp3';
  if (sounds[src]) {
    let derezz = new Audio(src);
    derezz.play();
  }
}
