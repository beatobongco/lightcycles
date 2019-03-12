import { stageWidth, stageHeight, gridSize } from './constants';
import { two } from './constants';

const numRegions = 36; // per dimension, so that would be num x num
const xBreakPoint = Math.floor(stageWidth / numRegions);
const yBreakPoint = Math.floor(stageHeight / numRegions);
const regions = [];
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

  // create grid and regions
  for (let x = 0; x <= stageWidth; x += gridSize) {
    two.makeLine(x, 0, x, stageHeight).stroke = '#fff';
  }
  for (let y = 0; y <= stageHeight; y += gridSize) {
    two.makeLine(0, y, stageWidth, y).stroke = '#fff';
  }

  two.update();

  // create regions
  let maxY = null;
  let minY = 0;
  for (let y = 0; y <= stageHeight; y++) {
    if (y !== 0 && y % yBreakPoint === 0) {
      maxY = y;
      let maxX = null;
      let minX = 0;
      for (let x = 0; x <= stageWidth; x++) {
        if (x !== 0 && x % xBreakPoint === 0) {
          maxX = x;
          regions.push({
            minX,
            maxX,
            minY,
            maxY,
            lightTrails: []
          });
          // for visualization, change later to some configurable variable
          if (true) {
            const rect = two.makeRectangle(
              (maxX + minX) / 2,
              (maxY + minY) / 2,
              maxX - minX,
              maxY - minY
            );
            rect.fill = 'red';
            rect.opacity = 0.5;
          }
          const lastRegion = regions.length > 0 && regions[regions.length - 1];
          if (lastRegion) {
            minX = lastRegion.maxX + 1;
          }
        }
      }
      const lastRegion = regions.length > 0 && regions[regions.length - 1];
      if (lastRegion) {
        minY = lastRegion.maxY + 1;
      }
    }
  }
  // for debugging, can remove later on
  G.regions = regions;
}

function getRegion(x, y) {
  for (let i = 0; i < regions.length; i++) {
    const r = regions[i];
    if (x >= r.minX && x <= r.maxX && y >= r.minY && y <= r.maxY) {
      return i;
    }
  }
}

export { initGrid, regions, getRegion };
