(function () {
  'use strict';

  const gridSize = 16;
  const stageWidth = 36 * gridSize; // x limit
  const stageHeight = 36 * gridSize; // y limit
  const maxSpeed = 6;
  const decelerationTime = 3;
  const accelerationTime = [3, 4, 6, 14, 16];
  const playerSize = 6;
  const hitboxSize = 5;
  const speedPerTick = 1;
  const leftVec = new Two.Vector(-speedPerTick, 0);
  const rightVec = new Two.Vector(speedPerTick, 0);
  const upVec = new Two.Vector(0, -speedPerTick);
  const downVec = new Two.Vector(0, speedPerTick);
  const two = new Two({
    width: stageWidth,
    height: stageHeight
  }).appendTo(document.getElementById('stage'));

  function initGrid() {
    const stage = two.makeRectangle(
      stageWidth / 2,
      stageHeight / 2,
      stageWidth,
      stageHeight
    );
    stage.fill = '#2c3e50';
    stage.stroke = '#ecf0f1';
    stage.linewidth = 3;

    // create grid
    for (let x = 0; x <= stageWidth; x += gridSize) {
      two.makeLine(x, 0, x, stageHeight).stroke = '#fff';
    }
    for (let y = 0; y <= stageHeight; y += gridSize) {
      two.makeLine(0, y, stageWidth, y).stroke = '#fff';
    }

    two.update();
  }

  function checkCollision(hitboxRect, player = null, lightTrailOffset = 2) {
    function _checkCollision(a, b, offset = 0) {
      if (
        !(
          a.right < b.left + offset ||
          a.left > b.right - offset ||
          a.bottom < b.top + offset ||
          a.top > b.bottom - offset
        )
      ) {
        return true;
      }
    }

    // Determines if an objects hitbox collided with or is near collidable objects
    // Returns {didCollide: bool, oppositeDir: vector for effects where valid}
    const result = { didCollide: false };
    // BIT
    if (G.bit && _checkCollision(hitboxRect, G.bit.getBoundingClientRect())) {
      result.obtainedBit = true;
    }
    // END BIT

    if (
      hitboxRect.right >= stageWidth ||
      hitboxRect.left <= 0 ||
      hitboxRect.bottom >= stageHeight ||
      hitboxRect.top <= 0
    ) {
      result.didCollide = true;
      return result;
    }

    // Use for-loops instead for better performance
    // https://github.com/dg92/Performance-Analysis-JS
    const lt = player ? player.lightTrails : [];
    for (let i = 0; i < G.players.length; i++) {
      if (
        player &&
        player.name !== G.players[i].name &&
        _checkCollision(
          hitboxRect,
          G.players[i].group._collection[1].getBoundingClientRect(),
          lightTrailOffset
        )
      ) {
        result.didCollide = true;
        return result;
      }

      for (let j = 0; j < G.players[i].lightTrails.length; j++) {
        let trail = G.players[i].lightTrails[j];
        // should be immune to your last 2 created trails
        if (
          player &&
          ((lt[lt.length - 1] && lt[lt.length - 1].id === trail.id) ||
            (lt[lt.length - 2] && lt[lt.length - 2].id === trail.id))
        ) {
          continue;
        }

        let trailHitbox = trail.getBoundingClientRect();
        if (_checkCollision(hitboxRect, trailHitbox, lightTrailOffset)) {
          result.didCollide = true;
          if (hitboxRect.right > trailHitbox.right) {
            result.oppositeDir = rightVec;
          } else if (hitboxRect.left < trailHitbox.left) {
            result.oppositeDir = leftVec;
          } else if (hitboxRect.bottom > trailHitbox.bottom) {
            result.oppositeDir = downVec;
          } else if (hitboxRect.top < trailHitbox.top) {
            result.oppositeDir = upVec;
          }
        }
      }
    }
    return result;
  }

  function checkPlayerCollision(player, offset) {
    return checkCollision(
      player.group._collection[1].getBoundingClientRect(),
      player,
      offset
    );
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

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function createShards(
    origin,
    color,
    offsetX,
    offsetY,
    pieces,
    momentum,
    minSize = 1,
    maxSize = 3,
    spreadFactor = playerSize
  ) {
    // creates a shards effect in a certain direction
    const _pieces = [];
    for (let i = 0; i < pieces; i++) {
      const poly = two.makePolygon(
        origin.x + getRandomInt(-spreadFactor, spreadFactor),
        origin.y + getRandomInt(-spreadFactor, spreadFactor),
        getRandomInt(minSize, maxSize), //size
        3 // make triangles
      );
      poly.fill = color;
      poly.noStroke();
      poly.rotation = getRandomInt(-10, 10);

      poly.translation.addSelf(
        new Two.Vector(
          getRandomInt(offsetX * spreadFactor, offsetX * momentum),
          getRandomInt(offsetY * spreadFactor, offsetY * momentum)
        )
      );
      _pieces.push(poly);
    }
    return two.makeGroup(..._pieces);
  }

  function getOppositeDirection(direction) {
    let oppX = 0,
      oppY = 0;
    if (direction === 'up') {
      oppY = 1;
    } else if (direction === 'down') {
      oppY = -1;
    } else if (direction === 'right') {
      oppX = -1;
    } else if (direction === 'left') {
      oppX = 1;
    }
    return { oppX, oppY };
  }

  let start = null;
  let roundTime = 30;

  const createTimer = _ => {
    G.timeLeft = roundTime;
    document.getElementById('timer').innerText = roundTime;
    start = Date.now();
    return setInterval(function() {
      const delta = Date.now() - start;
      const timer = document.getElementById('timer');
      G.timeLeft = roundTime - Math.floor(delta / 1000);
      timer.innerText = G.timeLeft;
      if (G.timeLeft <= 0) {
        G.gameOver = true;
        clearInterval(G.gameTimer);
      }
      if (G.timeLeft <= 5) {
        if (!timer.classList.contains('time-low')) {
          timer.classList.add('time-low');
        }
        playTick();
      }
    }, 1000);
  };

  function createHUD(el, name, wins, roundWins, speed) {
    let winDots = [
      '<span class="windot">&#9675;</span>',
      '<span class="windot">&#9675;</span>',
      '<span class="windot">&#9675;</span>'
    ];

    for (let i = 0; i < roundWins; i++) {
      winDots[i] = '<span class="windot">&#9679;</span>';
    }
    let winsHTML =
      wins > 0 ? `WINS: <span id="${name}-wins">${wins}</span>` : '&nbsp;';
    document.getElementById(el).innerHTML = `
    <div class="hud">
      <h3>${name}</h3>
      <p><small>ROUND</small></p>
      <div class="rounds">${winDots.join('')}</div>
      <p><small>SPEED</small></p>
      <h3 id="${name}-speed">${speed}</h3>
      <small class="tiny">${winsHTML}</small>
    </div>`;
  }

  function createPlayerCircle(x, y, strokeColor, fillColor) {
    const circle = two.makeCircle(x, y, playerSize);
    circle.stroke = strokeColor;
    circle.fill = fillColor;
    circle.linewidth = 2;
    const hitbox = two.makeRectangle(x, y, hitboxSize, hitboxSize);
    hitbox.fill = 'red'; // for debugging
    hitbox.noFill();
    hitbox.noStroke();
    const group = two.makeGroup(circle, hitbox);
    group.center();
    group.translation.set(x, y);
    return group;
  }

  function initPlayer(
    name,
    x,
    y,
    defaultDirection,
    wins,
    roundWins,
    strokeColor,
    fillColor,
    turboColor,
    sparkColor,
    HUDelement
  ) {
    const p = {
      name: name,
      prevDirection: defaultDirection,
      direction: defaultDirection,
      lastMoveFrame: 0,
      _speed: 1,
      get speed() {
        return this._speed;
      },
      set speed(spd) {
        document.getElementById(`${name}-speed`).innerText = spd;
        this._speed = spd;
      },
      get wins() {
        return this._wins;
      },
      set wins(wns) {
        this._wins = wns;
        createHUD(HUDelement, name, wns, this.roundWins, this._speed);
      },
      _roundWins: roundWins,
      get roundWins() {
        return this._roundWins;
      },
      set roundWins(rnd) {
        this._roundWins = rnd;
        createHUD(HUDelement, name, this.wins, rnd, this._speed);
      },
      isAccelerating: false,
      isBraking: false,
      lastDecelerateFrame: 0,
      lastAccelerateFrame: 0,
      lastBrakeFrame: 0,
      alive: true,
      _wins: wins,
      group: createPlayerCircle(x, y, strokeColor, fillColor),
      fillColor: fillColor,
      strokeColor: strokeColor,
      originalStroke: strokeColor,
      turboColor: turboColor,
      sparkColor: sparkColor,
      currentOrigin: new Two.Vector(x, y),
      lightTrails: [],
      corpse: null,
      sparks: null,
      sound: new Audio(),
      soundPromise: null,
      score: 0 // 1 per unit distance traveled
    };
    createHUD(HUDelement, name, wins, roundWins, 1);

    return p;
  }

  function initUser(carryOverWins = false) {
    return initPlayer(
      'P1',
      Math.round(stageWidth / 2),
      gridSize * 8,
      'down',
      G.user ? G.user.wins : 0,
      carryOverWins && G.user ? G.user.roundWins : 0,
      '#3498db',
      '#ffffff',
      '#67CBFF',
      '#E7FFFF',
      'userHud'
    );
  }

  function initEnemy(carryOverWins = false) {
    return initPlayer(
      'P2',
      Math.round(stageWidth / 2),
      stageHeight - gridSize * 8,
      'up',
      G.enemy ? G.enemy.wins : 0,
      carryOverWins && G.enemy ? G.enemy.roundWins : 0,
      '#e67e22',
      '#000000',
      '#FFB155',
      '#FFFFD5',
      'enemyHud'
    );
  }

  function initPlayers(carryOverWins = false) {
    if (G.noPlayer === 1) {
      G.enemy = initEnemy(0, 0);
      G.players = [G.enemy];
    } else if (G.noPlayer === 2) {
      G.user = initUser(0, 0);
      G.players = [G.user];
    } else {
      G.user = initUser(carryOverWins);
      G.enemy = initEnemy(carryOverWins);
      G.players = [G.user, G.enemy];
    }
  }

  function generateBit() {
    // Generates a little guy you can get for points
    if (G.bit) {
      two.remove(G.bit);
    }
    let group, inner, outer;
    outer = two.makeCircle(0, 0, 6);
    outer.fill = '#16a085';
    outer.noStroke();
    outer.opacity = 0.5;
    inner = two.makeCircle(0, 0, 4);
    inner.fill = '#1abc9c';
    inner.noStroke();
    group = two.makeGroup(outer, inner);
    group.center();
    group.translation.set(
      getRandomInt(0, stageWidth),
      getRandomInt(0, stageHeight)
    );
    G.bit = group;

    if (checkCollision(G.bit).didCollide) {
      console.log('bit collided');
      G.bit.translation.set(
        getRandomInt(0, stageWidth),
        getRandomInt(0, stageHeight)
      );
    }
  }
  window.generateBit = generateBit;

  const userKeyAcc = 'KeyT';
  const enemyKeyAcc = 'BracketRight';

  function playerMove(player, direction) {
    // dont allow movements in opposite directions
    if (
      (direction === 'down' && player.prevDirection !== 'up') ||
      (direction === 'up' && player.prevDirection !== 'down') ||
      (direction === 'right' && player.prevDirection !== 'left') ||
      (direction === 'left' && player.prevDirection !== 'right')
    ) {
      player.direction = direction;
    }
  }

  function pAccelerate(player) {
    if (!player.isAccelerating) {
      playAccelerateSound(1);
    }
    player.isAccelerating = true;
  }

  function startGame() {
    G.gameOverText = null;
    G.gameTimer = createTimer();
    G.gameOver = false;
    document.getElementById('gameOverContainer').style.display = 'none';
    if (!G.players || G.players.some(p => p.roundWins === 3)) {
      initPlayers();
    } else {
      // init players, carrying over wins
      initPlayers(true);
    }
    initPlayerSounds();

    if (G.noPlayer) {
      generateBit();
    }
    G.instance.play();
  }

  function initControls() {
    document.body.onkeydown = k => {
      if (k.code === 'KeyR') {
        const docElem = document.documentElement;
        if (docElem.requestFullscreen) {
          docElem.requestFullscreen();
        } else if (docElem.mozRequestFullScreen) {
          /* Firefox */
          docElem.mozRequestFullScreen();
        } else if (docElem.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          docElem.webkitRequestFullscreen();
        } else if (docElem.msRequestFullscreen) {
          /* IE/Edge */
          docElem.msRequestFullscreen();
        }
        if (G.firstRun) {
          G.firstRun = false;
          startGame();
        } else if (G.gameOver) {
          document.getElementById('timer').classList.remove('time-low');
          G.players.forEach(p => {
            two.remove(p.group);
            two.remove(p.corpse);
            two.remove(p.sparks);
            p.lightTrails.forEach(l => {
              two.remove(l);
            });
          });

          startGame();
        }
      } else if (k.code === 'Pause' && G.pauseEnabled) {
        if (G.instance.playing) {
          G.instance.pause();
        } else {
          G.instance.play();
        }
      } else if (!G.gameOver) {
        switch (k.code) {
          // user controls
          case 'KeyS':
            playerMove(G.user, 'down');
            break;
          case 'KeyW':
            playerMove(G.user, 'up');
            break;
          case 'KeyA':
            playerMove(G.user, 'left');
            break;
          case 'KeyD':
            playerMove(G.user, 'right');
            break;
          case userKeyAcc:
            pAccelerate(G.user);
            break;
          // enemy controls
          case 'ArrowDown':
            playerMove(G.enemy, 'down');
            break;
          case 'ArrowUp':
            playerMove(G.enemy, 'up');
            break;
          case 'ArrowLeft':
            playerMove(G.enemy, 'left');
            break;
          case 'ArrowRight':
            playerMove(G.enemy, 'right');
            break;
          case enemyKeyAcc:
            pAccelerate(G.enemy);
            break;
        }
      }
    };
    document.body.onkeyup = k => {
      if (!G.gameOver) {
        switch (k.code) {
          case userKeyAcc:
            G.user.isAccelerating = false;
            break;
          case enemyKeyAcc:
            G.enemy.isAccelerating = false;
            break;
        }
      }
    };
  }

  initGrid();
  initControls();

  function createLightTrail(player) {
    // TODO: find a way to fill in the line without causing crashes
    // due to excess hitbox
    const lightTrail = two.makeLine(
      player.currentOrigin.x,
      player.currentOrigin.y,
      player.group.translation.x,
      player.group.translation.y
    );
    lightTrail.stroke = player.strokeColor;
    lightTrail.linewidth = 6;
    lightTrail.opacity = 0.9;
    lightTrail.origin = player.currentOrigin;

    // If lines have same origin, remove them from the list
    if (player.lightTrails.length > 0) {
      const lastTrail = player.lightTrails[player.lightTrails.length - 1];
      if (
        lastTrail.origin.equals(lightTrail.origin) &&
        lastTrail.stroke === lightTrail.stroke
      ) {
        two.remove(player.lightTrails.pop());
      }
    }
    player.lightTrails.push(lightTrail);
  }

  function generateMove(player, frameCount) {
    let bonus = 0;
    if (player.isAccelerating) {
      if (
        player.speed < maxSpeed &&
        frameCount - player.lastAccelerateFrame >
          accelerationTime[player.speed - 1]
      ) {
        player.speed += 1;
        player.lastAccelerateFrame = frameCount;
      }
    } else if (
      frameCount - player.lastDecelerateFrame > decelerationTime &&
      player.speed > 1
    ) {
      // by default player slows down
      player.speed -= 1;
      player.lastDecelerateFrame = frameCount;
    }

    const slipstream = checkPlayerCollision(player, -3);
    if (slipstream.didCollide) {
      bonus = Math.ceil(player.speed * 0.5);
      if (
        player.strokeColor !== player.turboColor &&
        player.speed + bonus > maxSpeed
      ) {
        // drop a new origin for turbo
        player.strokeColor = player.turboColor;
        player.currentOrigin = player.group.translation.clone();
      }
    }

    if (
      player.strokeColor === player.turboColor &&
      player.speed + bonus <= maxSpeed
    ) {
      player.strokeColor = player.originalStroke;
      player.currentOrigin = player.group.translation.clone();
    }

    let cooldown = Math.round(Math.max(0, 6 / Math.max(1, player.speed + bonus)));
    if (player.speed === maxSpeed) {
      cooldown = 0;
    }
    // only register changes of directions every <cooldown> frames
    let direction = player.direction;
    const trn = player.group.translation;

    for (let i = 0; i < player.speed + bonus; i++) {
      player.score += 1;
      if (
        player.direction !== player.prevDirection &&
        frameCount - player.lastMoveFrame > cooldown
      ) {
        // set a new origin for the light trail
        player.currentOrigin = player.group.translation.clone();
        player.prevDirection = direction;
        player.lastMoveFrame = frameCount;
        // reset sound when turning
        player.sound.currentTime = 0;
      } else {
        direction = player.prevDirection;
      }
      switch (direction) {
        case 'left':
          trn.addSelf(leftVec);
          break;
        case 'right':
          trn.addSelf(rightVec);
          break;
        case 'up':
          trn.addSelf(upVec);
          break;
        case 'down':
          trn.addSelf(downVec);
          break;
      }
      if (hitboxSize % (i + 1) === 0) {
        const collision = checkPlayerCollision(player);
        if (collision.didCollide) {
          playDerezzSound();
          player.alive = false;
          two.remove(player.group);
          const { oppX, oppY } = getOppositeDirection(direction);
          player.corpse = createShards(
            player.group.translation,
            player.fillColor,
            oppX,
            oppY,
            getRandomInt(3, 3 * player.speed),
            playerSize * player.speed * (player.speed / 2),
            2,
            3
          );
        } else if (collision.obtainedBit) {
          player.score += 250;
          generateBit();
        }
      }
    }
    playBikeSound(player, bonus);
    createLightTrail(player);
    two.remove(player.sparks);
    if (slipstream.didCollide) {
      // https://codepen.io/anon/pen/wNRegz
      const base = 1 + player.speed;
      const { x, y } = slipstream.oppositeDir || { x: 0, y: 0 };
      const { oppX, oppY } = getOppositeDirection(direction);
      player.sparks = createShards(
        player.group.translation,
        player.sparkColor,
        x + oppX * base,
        y + oppY * base,
        getRandomInt(3, 3 + player.speed),
        1 + Math.round(player.speed * 2),
        2,
        2,
        playerSize / 2
      );
    }
    // Make circle on top of trail
    two.remove(player.group);
    player.group = createPlayerCircle(
      trn.x,
      trn.y,
      player.strokeColor,
      player.fillColor
    );
    return direction;
  }

  G.instance = two.bind('update', frameCount => {
    stats.begin();
    if (!G.gameOver) {
      for (let i = 0; i < G.players.length; i++) {
        generateMove(G.players[i], frameCount);
      }
      for (let i = 0; i < G.players.length; i++) {
        if (!G.players[i].alive) {
          G.gameOver = true;
        }
      }
    } else {
      clearInterval(G.gameTimer);

      let subtext = 'Press `R` to play next round.';

      // If all players are dead, it's a draw
      if (G.players.every(p => !p.alive)) {
        G.gameOverText = 'DRAW';
      } else if (G.timeLeft <= 0) {
        // If timer is up, base it on score
        G.gameOverText = 'TIME UP';
        let winner = null;
        let score = 0;
        let pointsText = '';
        G.players.forEach(p => {
          pointsText += `<p>${p.name}: ${p.score} pts</p>`;
          if (p.score > score) {
            score = p.score;
            winner = p;
          } else if (p.score === score) {
            winner = null;
          }
        });
        if (winner) {
          winner.roundWins += 1;
          subtext = `${winner.name} WINS <p>${
          winner.name
        } has a longer jetwall. </p>
        ${pointsText}
        <p>${subtext}</p>`;
        } else {
          subtext = `DRAW. <p>${subtext} </p>`;
        }
      } else {
        // If 1 player alive show his win
        G.players.some(p => {
          if (p.alive) {
            G.gameOverText = `${p.name} WINS`;
            p.roundWins += 1;
            return true;
          }
        });
      }

      document.getElementById('gameOverSubtext').innerHTML = subtext;

      G.players.some(p => {
        if (p.roundWins === 3) {
          p.wins += 1;
          G.gameOverText = `${p.name} WINS THE MATCH`;
          document.getElementById(
            'gameOverSubtext'
          ).innerText = `Press \`R\` for rematch.`;
          return true;
        }
      });
      document.getElementById('gameOverContainer').style.display = 'flex';
      document.getElementById('gameOverText').innerText = G.gameOverText;
      stopPlayerSounds();
      two.pause();
    }
    stats.end();
  });

}());
