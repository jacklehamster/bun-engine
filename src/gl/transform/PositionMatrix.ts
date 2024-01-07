import { Position, transformToPosition } from "world/grid/Position";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { CellPos } from "world/grid/CellPos";

export class PositionMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create().setPosition(0, 0, 0);
  private prePosition: Position = [0, 0, 0];
  private position: Position = [0, 0, 0];

  constructor(private onChange?: (previous: Position) => void) {
  }

  private changedPosition() {
    this.prePosition[0] = this.position[0];
    this.prePosition[1] = this.position[1];
    this.prePosition[2] = this.position[2];
    transformToPosition(this.matrix, this.position);
    this.onChange?.(this.prePosition);
  }

  moveMatrix(x: number, y: number, z: number, turnMatrix?: IMatrix) {
    this.matrix.moveMatrix(x, y, z, turnMatrix);
    this.changedPosition();
  }

  setPosition(x: number, y: number, z: number) {
    this.matrix.setPosition(x, y, z);
    this.changedPosition();
  }

  getPosition() {
    return this.position;
  }

  private static _cellPos: CellPos = [0, 0, 0, 0];
  getCellPosition(cellSize: number) {
    return PositionMatrix.getCellPos(this.getPosition(), cellSize);
  }

  static getCellPos(pos: Position, cellSize: number) {
    this._cellPos[0] = Math.floor(pos[0] / cellSize);
    this._cellPos[1] = Math.floor(pos[1] / cellSize);
    this._cellPos[2] = Math.floor(pos[2] / cellSize);
    this._cellPos[3] = cellSize;
    return this._cellPos;
  }

  public translate(x: number, y: number, z: number) {
    this.matrix.translate(x, y, z);
    this.changedPosition();
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
