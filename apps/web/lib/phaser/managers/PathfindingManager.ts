import EasyStar from "easystarjs";
import { MAP_WIDTH, MAP_HEIGHT } from "../data/office-map";

export interface PathPoint {
  x: number;
  y: number;
}

export class PathfindingManager {
  private easyStar: EasyStar.js;
  private calculating = false;

  constructor(collisionGrid: number[][]) {
    this.easyStar = new EasyStar.js();
    this.easyStar.setGrid(collisionGrid);
    this.easyStar.setAcceptableTiles([0]);
    this.easyStar.enableDiagonals();
    this.easyStar.disableCornerCutting();
    this.easyStar.setIterationsPerCalculation(Number.MAX_SAFE_INTEGER);
  }

  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    callback: (path: PathPoint[] | null) => void
  ): void {
    if (
      startX < 0 ||
      startX >= MAP_WIDTH ||
      startY < 0 ||
      startY >= MAP_HEIGHT ||
      endX < 0 ||
      endX >= MAP_WIDTH ||
      endY < 0 ||
      endY >= MAP_HEIGHT
    ) {
      callback(null);
      return;
    }

    if (this.calculating) {
      this.easyStar.cancelPath();
    }

    this.calculating = true;

    this.easyStar.findPath(startX, startY, endX, endY, (path) => {
      this.calculating = false;
      callback(path);
    });

    this.easyStar.calculate();
  }

  updateGrid(collisionGrid: number[][]): void {
    this.easyStar.setGrid(collisionGrid);
    this.easyStar.setAcceptableTiles([0]);
  }
}
