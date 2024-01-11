import { Position, toPos, transformToPosition } from "world/grid/Position";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { CellPos } from "world/grid/CellPos";
import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { MoveBlocker } from "./aux/MoveBlocker";

export class PositionMatrix extends AuxiliaryHolder<PositionMatrix> implements IMatrix {
  private matrix: Matrix = Matrix.create().setPosition(0, 0, 0);
  private _position: Position = [0, 0, 0];
  private static _cellPos: CellPos = [0, 0, 0, 0];
  moveBlocker?: MoveBlocker;

  constructor(private onChange?: () => void) {
    super();
  }

  private changedPosition() {
    transformToPosition(this.matrix, this._position);
    this.onChange?.();
  }

  moveBy(x: number, y: number, z: number, turnMatrix?: IMatrix) {
    const vector = this.matrix.getMoveVector(x, y, z, turnMatrix);
    if (!this.moveBlocker?.isBlocked(toPos(
      this.position[0] + vector[0],
      this.position[1] + vector[1],
      this.position[2] + vector[2],
    ), this.position)) {
      this.matrix.move(vector);
      this.changedPosition();
    }
  }

  moveTo(x: number, y: number, z: number) {
    if (!this.moveBlocker?.isBlocked(toPos(x, y, z))) {
      this.matrix.setPosition(x, y, z);
      this.changedPosition();
    }
  }

  get position() {
    return this._position;
  }

  getCellPosition(cellSize: number) {
    return PositionMatrix.getCellPos(this.position, cellSize);
  }

  static getCellPos(pos: Position, cellSize: number) {
    this._cellPos[0] = Math.round(pos[0] / cellSize);
    this._cellPos[1] = Math.round(pos[1] / cellSize);
    this._cellPos[2] = Math.round(pos[2] / cellSize);
    this._cellPos[3] = cellSize;
    return this._cellPos;
  }

  gotoPos(x: number, y: number, z: number, speed: number = .1) {
    const curPos = this.position;
    const dx = x - curPos[0];
    const dy = y - curPos[1];
    const dz = z - curPos[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > .01) {
      const sp = Math.min(dist, speed);
      this.moveBy(
        dx / dist * sp,
        dy / dist * sp,
        dz / dist * sp,
      );
    } else {
      this.moveTo(x, y, z);
    }
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
