import {
  stageWidth,
  gridSize,
  two,
  playerSize,
  hitboxSize,
  stageHeight,
  scoreKey
} from './constants';

function renderJoinUI(el, playerName, control) {
  document.getElementById(el).innerHTML = `
    <h3>${playerName}</h3>
    <div class="blink infinite">
      <p><small class="tiny">PRESS</small></p>
      <p class="centered">${control}</p>
      <p><small class="tiny">TO JOIN</small></p>
    </div>
  `;
}

function renderHUD(player, newWin) {
  const n = '';
  const { el, name, wins, roundWins, speed, score } = player;
  let roundsHTML = n,
    winsHTML = n,
    scoreHTML = n;
  if (G.mode === '2P') {
    let roundDots = [
      '<span class="windot">&#9675;</span>',
      '<span class="windot">&#9675;</span>',
      '<span class="windot">&#9675;</span>'
    ];
    for (let i = 0; i < roundWins; i++) {
      let classes = 'win windot';
      if (newWin && i === roundWins - 1) {
        classes += ' blink';
      }
      roundDots[i] = `<span class="${classes}">&#9679;</span>`;
    }
    roundsHTML = `<p><small>ROUND</small></p>
    <div class="rounds">${roundDots.join('')}</div>`;
    winsHTML =
      wins > 0
        ? `<small class="tiny">
            WINS: <span id="${name}-wins">${wins}</span>
          </small>`
        : n;
  }
  scoreHTML = `<p><small>SCORE</small></p>
  <p><small>${score}</small></p>`;
  if (G.mode === '1P') {
    const hiscore = localStorage.getItem(scoreKey);
    if (hiscore > 0) {
      scoreHTML += `<p><small>RECORD</small></p>
    <p><small>${hiscore}</small></p>`;
    }
  }
  document.getElementById(el).innerHTML = `
    <div>
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
  hitbox.noFill();
  hitbox.noStroke();
  const group = two.makeGroup(circle, hitbox);
  group.center();
  group.translation.set(x, y);
  // for debugging
  // circle.noFill();
  // circle.noStroke();
  // hitbox.fill = 'red';
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
    trailPoint: new Two.Vector(x, y),
    immuneTrails: [],
    dropTrailPoint() {
      const point = this.group.translation.clone();
      this.immuneTrails = [this.trailPoint, point];
      this.trailPoint = point;
    },
    getHitbox() {
      return this.group._collection[1].getBoundingClientRect();
    },
    getSsHitbox() {
      return this.group._collection[0].getBoundingClientRect();
    },
    increaseRoundWins() {
      this.roundWins += 1;
      renderHUD(this, true);
    },
    roundWins: roundWins,
    el: HUDelement,
    name: name,
    direction: defaultDirection,
    directionBuffer: [],
    lastMoveDist: 0,
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
      renderHUD(this);
    },
    _score: 0, // 1 per unit distance traveled
    get score() {
      return this._score;
    },
    set score(s) {
      this._score = s;
      renderHUD(this);
    },
    type: 'player',
    isAccelerating: false,
    lastDecelerateFrame: 0,
    lastAccelerateFrame: 0,
    alive: true,
    _wins: wins,
    group: createPlayerCircle(x, y, strokeColor, fillColor),
    fillColor: fillColor,
    strokeColor: strokeColor,
    originalStroke: strokeColor,
    originalFill: fillColor,
    turboColor: turboColor,
    sparkColor: sparkColor,
    corpses: [],
    sparks: null,
    sound: new Audio(),
    soundPromise: null,
    hasShield: false,
    shieldDist: 0 // distance travelled while shield procs
  };
  renderHUD(p);

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
    renderJoinUI('userHud', 'P1', 'W');
  } else if (G.noPlayer === 2) {
    G.user = initUser(0, 0);
    G.players = [G.user];
    renderJoinUI(
      'enemyHud',
      'P2',
      '<span>UP</span> <small class="tiny">ARROW</small>'
    );
  } else {
    G.user = initUser(carryOverWins);
    G.enemy = initEnemy(carryOverWins);
    G.players = [G.user, G.enemy];
  }
}

export { initPlayers, createPlayerCircle };
