import { Angle, angle } from "gl/utils/angleUtils";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { Progressive } from "core/value/Progressive";

export class TiltMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();;
  private _tilt: Angle = 0;
  progressiveTilt: Progressive<TiltMatrix>;

  constructor(private onChange?: () => void) {
    this.progressiveTilt = new Progressive<TiltMatrix>(this,
      (matrix) => matrix.tilt,
      (matrix, value) => matrix.tilt = value,
    );
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
