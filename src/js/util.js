import { playerSize, two } from './constants';

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

export { getOppositeDirection, getRandomInt, createShards };
