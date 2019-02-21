import { stageWidth, stageHeight, gridSize } from './constants';
import { two } from './constants';

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

export default initGrid;
