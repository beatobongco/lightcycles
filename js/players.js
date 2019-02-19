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

function initUser(wins, roundWins) {
  return initPlayer(
    'P1',
    Math.round(stageWidth / 2),
    gridSize * 8,
    'down',
    wins,
    roundWins,
    '#3498db',
    '#ffffff',
    '#67CBFF',
    '#E7FFFF',
    'userHud'
  );
}

function initEnemy(wins, roundWins) {
  return initPlayer(
    'P2',
    Math.round(stageWidth / 2),
    stageHeight - gridSize * 8,
    'up',
    wins,
    roundWins,
    '#e67e22',
    '#000000',
    '#FFB155',
    '#FFFFD5',
    'enemyHud'
  );
}
