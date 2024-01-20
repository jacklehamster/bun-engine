import { ObjectPool } from "utils/ObjectPool";
import { Cell } from "../grid/Cell";
import { cellTag } from "../grid/utils/cell-utils";
import { Vector } from "core/types/Vector";

export class CellPool extends ObjectPool<Cell, [Vector, number]> {
  constructor(onCreate: () => void) {
    super((cell, [x, y, z], cellSize) => {
      const cx = Math.round(x / cellSize);
      const cy = Math.round(y / cellSize);
      const cz = Math.round(z / cellSize);
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
    }, onCreate);
  }
}
