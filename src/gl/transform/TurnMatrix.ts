import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { NumVal } from "core/value/NumVal";

export class TurnMatrix implements IMatrix {
  private matrix: Matrix = Matrix.create();
  readonly angle: NumVal;

  constructor(onChange?: () => void) {
    this.angle = new NumVal(0, tilt => {
      this.matrix.setYRotation(tilt);
      onChange?.();
    });
  }

  getMatrix(): Float32Array {
    return this.matrix.getMatrix();
  }
}
