import { IAngleMatrix } from "./IAngleMatrix";
import Matrix from "./Matrix";
import { NumVal } from "core/value/NumVal";

export class TiltMatrix implements IAngleMatrix {
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
