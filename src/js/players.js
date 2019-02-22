import {
  stageWidth,
  gridSize,
  two,
  playerSize,
  hitboxSize,
  stageHeight
} from './constants';
import { getRandomInt } from './util';
import { checkCollision } from './collisions';

function createHUD(player) {
  const n = '';
  const { el, name, wins, roundWins, speed, score } = player;
  let mode = G.noPlayer ? '1P' : '2P';
  let roundsHTML = n,
    winsHTML = n,
    scoreHTML = n;
  if (mode === '2P') {
    let roundDots = [
      '<span class="windot">&#9675;</span>',
      '<span class="windot">&#9675;</span>',
      '<span class="windot">&#9675;</span>'
    ];
    for (let i = 0; i < roundWins; i++) {
      roundDots[i] = '<span class="windot">&#9679;</span>';
    }
    roundsHTML = `<p><small>ROUND</small></p>
    <div class="rounds">${roundDots.join('')}</div>`;
    winsHTML =
      wins > 0
        ? `<small class="tiny">
            WINS: <span id="${name}-wins">${wins}</span>
          </small>`
        : n;
  } else if (mode === '1P') {
    scoreHTML = `<p><small>SCORE</small></p>
    <p><small>${score}</small></p>`;
  }
  document.getElementById(el).innerHTML = `
    <div class="hud">
      <h3>${name}</h3>
      ${roundsHTML}
      <p><small>SPEED</small></p>
      <h3 id="${name}-speed">${speed}</h3>
      ${scoreHTML}
      ${winsHTML}
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
    el: HUDelement,
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
      createHUD(this);
    },
    _roundWins: roundWins,
    get roundWins() {
      return this._roundWins;
    },
    set roundWins(rnd) {
      this._roundWins = rnd;
      createHUD(this);
    },
    _score: 0, // 1 per unit distance traveled
    get score() {
      return this._score;
    },
    set score(s) {
      this._score = s;
      createHUD(this);
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
    soundPromise: null
  };
  createHUD(p);

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
  outer.fill = '#1abc9c';
  outer.noStroke();
  outer.opacity = 0.9;
  inner = two.makeCircle(0, 0, 4);
  inner.fill = '#E6FFFF';
  inner.noStroke();
  group = two.makeGroup(outer, inner);
  group.center();
  group.translation.set(
    getRandomInt(0, stageWidth),
    getRandomInt(0, stageHeight)
  );
  G.bit = group;

  if (checkCollision(G.bit.getBoundingClientRect()).didCollide) {
    // Generate bit at random position until it doesn't collide with anything
    console.log('bit collided');
    generateBit();
  }
}
export { initPlayers, generateBit, createPlayerCircle };
