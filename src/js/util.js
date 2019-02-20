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

function createHUD(el, name, wins, roundWins, speed) {
  let winDots = [
    '<span class="windot">&#9675;</span>',
    '<span class="windot">&#9675;</span>',
    '<span class="windot">&#9675;</span>'
  ];

  for (let i = 0; i < roundWins; i++) {
    winDots[i] = '<span class="windot">&#9679;</span>';
  }
  winsHTML =
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
