const gridSize = 16;
const stageWidth = 36 * gridSize; // x limit
const stageHeight = 36 * gridSize; // y limit
const maxSpeed = 6;
const decelerationTime = 3;
// was 14, 16
const accelerationTime = [3, 4, 6, 9, 13];
const playerSize = 6;
const hitboxSize = 4;
const speedPerTick = 1;
const leftVec = new Two.Vector(-speedPerTick, 0);
const rightVec = new Two.Vector(speedPerTick, 0);
const upVec = new Two.Vector(0, -speedPerTick);
const downVec = new Two.Vector(0, speedPerTick);
const scoreKey = 'lightcycles/HISCORE';
const lightTrailWidth = 6;
const two = new Two({
  width: stageWidth,
  height: stageHeight
}).appendTo(document.getElementById('stage'));

export {
  gridSize,
  stageWidth,
  stageHeight,
  maxSpeed,
  decelerationTime,
  accelerationTime,
  playerSize,
  hitboxSize,
  leftVec,
  rightVec,
  upVec,
  downVec,
  two,
  scoreKey,
  lightTrailWidth
};
