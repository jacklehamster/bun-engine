import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

const CYCLE = 2 * Math.PI;

export class TurnMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();;
  private _turn: number = 0;

  get turn(): number {
    return this._turn;
  }

  set turn(value: number) {
    this._turn = (value % CYCLE + CYCLE) % CYCLE;
    this.matrix.setYRotation(this._turn);
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
