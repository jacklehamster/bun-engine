import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

const CYCLE = 2 * Math.PI;

export class TiltMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();;
  private _tilt: number = 0;

  get tilt(): number {
    return this._tilt;
  }

  set tilt(value: number) {
    this._tilt = (value % CYCLE + CYCLE) % CYCLE;
    this.matrix.setXRotation(this._tilt);
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
