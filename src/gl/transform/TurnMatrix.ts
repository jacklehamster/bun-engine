import { Angle, angle } from "gl/utils/angleUtils";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

export class TurnMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();;
  private _turn: Angle = 0;

  get turn(): Angle {
    return this._turn;
  }

  set turn(value: number) {
    this._turn = angle(value);
    this.matrix.setYRotation(this._turn);
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
