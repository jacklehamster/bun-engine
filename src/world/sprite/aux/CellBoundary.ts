import { Cell } from "cell-tracker";
import { IBoundary } from "./IBoundary";


interface Config {
  xRange?: [number, number];
  yRange?: [number, number];
  zRange?: [number, number];
}

export class CellBoundary implements IBoundary {
  private minX: number; private maxX: number;
  private minY: number; private maxY: number;
  private minZ: number; private maxZ: number;
  constructor(config: Config) {
    this.minX = config?.xRange?.[0] ?? Number.NEGATIVE_INFINITY;
    this.maxX = config?.xRange?.[1] ?? Number.POSITIVE_INFINITY;
    this.minY = config?.yRange?.[0] ?? Number.NEGATIVE_INFINITY;
    this.maxY = config?.yRange?.[1] ?? Number.POSITIVE_INFINITY;
    this.minZ = config?.zRange?.[0] ?? Number.NEGATIVE_INFINITY;
    this.maxZ = config?.zRange?.[1] ?? Number.POSITIVE_INFINITY;
  }

  include(cell: Cell): boolean {
    const x = cell.pos[0];
    const y = cell.pos[1];
    const z = cell.pos[2];
    if (x < this.minX || this.maxX < x || y < this.minY || this.maxY < y || z < this.minZ || this.maxZ < z) {
      return false;
    }
    return true;
  }
}
