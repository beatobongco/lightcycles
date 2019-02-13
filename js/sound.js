// Preload sounds, keep them in an object to know if they are loaded
const sounds = {
  'sound/speed1.ogg': false,
  'sound/speed2.ogg': false,
  'sound/speed3.ogg': false,
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
    player.sound.src = `sound/speed${player.speed}.ogg`;
    player.soundPromise = player.sound.play();
  });
}

function stopPlayerSounds() {
  players.forEach(player => {
    player.sound.pause();
  });
}

function playBikeSound(player) {
  function _playBikeSound(player, src) {
    const currSrc = player.sound.src.split('/');
    const lastTwo = currSrc.slice(currSrc.length - 2, currSrc.length);
    if (src === lastTwo.join('/')) {
      return;
    }
    player.soundPromise.then(_ => {
      const newSound = new Audio(src);
      newSound.oncanplay = _ => {
        player.sound.pause();
        player.sound = newSound;
        player.soundPromise = player.sound.play();
      };
    });
  }
  if (player.isAccelerating) {
    _playBikeSound(player, 'sound/speed3.ogg');
  } else if (player.isBraking) {
    _playBikeSound(player, 'sound/speed1.ogg');
  } else {
    _playBikeSound(player, 'sound/speed1.ogg');
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
