/*
  Have position iterate from inwards to outwards.
*/

import { CellPos } from "./CellPos";

export class CellPosIterator implements Iterator<CellPos> {
  private cellPos: CellPos = [0, 0, 0];
  private manDist: number = 0;
  private started: boolean = false;

  constructor(private maxManDist: number) {
  }

  private result: IteratorResult<CellPos> = {
    value: this.cellPos,
    done: false,
  };

  next(): IteratorResult<CellPos, any> {
    if (!this.started) {
      this.started = true;
    } else if (!this.result.done) {
      let [x, y, z] = this.cellPos;
      const xyzMax = this.manDist;
      const xyMax = xyzMax - Math.abs(z);
      const xMax = xyMax - Math.abs(y);
      if (z >= xyzMax) {
        this.manDist++;
        z = -this.manDist;
        x = y = 0;
      } else if (y >= xyMax) {
        z++;
        y = (-this.manDist + Math.abs(z));
        x = (-this.manDist + Math.abs(z) + Math.abs(y));
      } else if (x >= xMax) {
        y++;
        x = (-this.manDist + Math.abs(z) + Math.abs(y));
      } else {
        x = -x;
      }
      this.cellPos[0] = x;
      this.cellPos[1] = y;
      this.cellPos[2] = z;
    }
    this.result.done = this.manDist > this.maxManDist;
    return this.result;
  }
}
