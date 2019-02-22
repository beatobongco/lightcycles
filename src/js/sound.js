import { maxSpeed } from './constants';
// Preload sounds, keep them in an object to know if they are loaded
const sounds = {
  'sound/speed1.ogg': false,
  'sound/speed2.ogg': false,
  'sound/speed3.ogg': false,
  'sound/slipstream.ogg': false,
  'sound/shiftup.mp3': false,
  'sound/rezzin.ogg': false,
  'sound/bit_spawn.ogg': false,
  'sound/playerjoin.ogg': false,
  'sound/derezz.mp3': false,
  'sound/timertick.ogg': false
};

function loadSounds() {
  Object.keys(sounds).forEach(s => {
    var _sound = new Audio();
    _sound.addEventListener('canplaythrough', () => {
      sounds[s] = true;
    });
    _sound.src = s;
  });
}

function initPlayerSounds() {
  G.players.forEach(player => {
    player.sound.src = `sound/speed1.ogg`;
    player.soundPromise = player.sound.play().catch(_ => {
      //catch DOMException errors
    });
  });
}

function stopPlayerSounds() {
  G.players.forEach(async function(player) {
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

function playAccelerateSound() {
  let shiftSound = new Audio('sound/shiftup.mp3');
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

function playJoinSound() {
  let sound = new Audio('sound/playerjoin.ogg');
  sound.play();
}

function playBitSpawnSound() {
  let sound = new Audio('sound/bit_spawn.ogg');
  sound.play();
}

function playRezzinSound() {
  let sound = new Audio('sound/rezzin.ogg');
  sound.play();
}

export {
  playBikeSound,
  playDerezzSound,
  playTick,
  loadSounds,
  initPlayerSounds,
  stopPlayerSounds,
  playAccelerateSound,
  playJoinSound,
  playBitSpawnSound,
  playRezzinSound
};
