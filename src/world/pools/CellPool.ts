import { ObjectPool } from "utils/ObjectPool";
import { Cell } from "../grid/Cell";
import { cellTag } from "world/grid/Cell";
import { Vector } from "core/types/Vector";

export class CellPool extends ObjectPool<Cell, [number, number, number, number]> {
  constructor() {
    super((cell, cx, cy, cz, cellSize) => {
      const tag = cellTag(cx, cy, cz, cellSize);
      if (!cell) {
        return { pos: [cx, cy, cz, cellSize], tag }
      }
      cell.pos[0] = cx;
      cell.pos[1] = cy;
      cell.pos[2] = cz;
      cell.pos[3] = cellSize;
      cell.tag = tag;
      return cell;
    });
  }

  createFromPos(pos: Vector, cellSize: number): Cell {
    const cx = Math.round(pos[0] / cellSize);
    const cy = Math.round(pos[1] / cellSize);
    const cz = Math.round(pos[2] / cellSize);
    return this.create(cx, cy, cz, cellSize);
  }
}
