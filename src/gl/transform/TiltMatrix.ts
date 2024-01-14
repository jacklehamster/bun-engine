import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { NumVal } from "core/value/NumVal";

export class TiltMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();
  readonly angle: NumVal;

  constructor(onChange?: () => void) {
    this.angle = new NumVal(0, tilt => {
      this.matrix.setXRotation(tilt);
      onChange?.();
    });
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
