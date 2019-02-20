// Temporary place for storing game modes
let noPlayer = parseInt(params.get('noPlayer'));
let bit = null;
function generateBit() {
  if (bit) {
    two.remove(bit);
  }
  bit = two.makeCircle(
    getRandomInt(0, stageWidth),
    getRandomInt(0, stageHeight),
    5
  );
  bit.fill = 'white';
  bit.noStroke();
}
