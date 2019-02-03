function initPlayerSounds() {
  players.forEach(player => {
    player.sound.src = `sound/${player.name}_speed${player.speed}.mp3`;
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
  var newSrc = `sound/${player.name}_speed${player.speed}.mp3`;
  var src = player.sound.src.split('/');
  var lastTwo = src.slice(src.length - 2, src.length);
  if (!(newSrc === lastTwo.join('/'))) {
    player.sound.src = newSrc;
    player.sound.play();
  }
}

function playShiftSound() {
  var shiftSound = new Audio('sound/shift.mp3');
  shiftSound.play();
}

function playDerezzSound() {
  var derezz = new Audio('sound/derezz.mp3');
  derezz.play();
}

initPlayerSounds();
