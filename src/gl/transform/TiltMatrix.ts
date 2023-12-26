import { Angle, angle } from "gl/utils/angleUtils";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

export class TiltMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();;
  private _tilt: Angle = 0;

  constructor(private onChange?: () => void) {
  }

  get tilt(): Angle {
    return this._tilt;
  }

  set tilt(value: number) {
    this._tilt = angle(value);
    this.matrix.setXRotation(this._tilt);
    this.onChange?.();
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
