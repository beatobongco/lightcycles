// Preload sounds, keep them in an object to know if they are loaded
const sounds = {
  'sound/speed1.ogg': false,
  'sound/speed2.ogg': false,
  'sound/speed3.ogg': false,
  'sound/slipstream.ogg': false,
  'sound/shiftup.mp3': false,
  'sound/shiftdown.mp3': false,
  'sound/derezz.mp3': false,
  'sound/timertick.ogg': false
};

Object.keys(sounds).forEach(s => {
  var _sound = new Audio(s);
  _sound.addEventListener('canplaythrough', () => {
    sounds[s] = true;
  });
});

function initPlayerSounds() {
  players.forEach(player => {
    player.sound.src = `sound/speed1.ogg`;
    player.soundPromise = player.sound.play().catch(_ => {
      //catch DOMException errors
    });
  });
}

function stopPlayerSounds() {
  players.forEach(async function(player) {
    await player.soundPromise;
    player.sound.pause();
  });
}

function playBikeSound(player, bonus) {
  //https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
  async function _playBikeSound(player, src) {
    const currSrc = player.sound.src.split('/');
    const lastTwo = currSrc.slice(currSrc.length - 2, currSrc.length);
    if (src === lastTwo.join('/')) {
      return;
    }
    await player.soundPromise;
    player.sound.src = src;
    player.soundPromise = player.sound.play().catch(_ => {
      //catch DOMException errors
    });
  }
  if (player.isAccelerating && !player.isBraking) {
    if (player.speed + bonus > maxSpeed) {
      _playBikeSound(player, 'sound/slipstream.ogg');
    } else if (player.speed === maxSpeed) {
      _playBikeSound(player, 'sound/speed3.ogg');
    } else {
      _playBikeSound(player, 'sound/speed2.ogg');
    }
  } else {
    _playBikeSound(player, 'sound/speed1.ogg');
  }
}

function playShiftSound(gear) {
  let src = 'sound/shiftdown.mp3';
  if (gear > 0) {
    src = 'sound/shiftup.mp3';
  }
  let shiftSound = new Audio(src);
  shiftSound.play();
}

function playDerezzSound() {
  let derezz = new Audio('sound/derezz.mp3');
  derezz.play();
}

function playTick() {
  let tick = new Audio('sound/timertick.ogg');
  tick.play();
}
