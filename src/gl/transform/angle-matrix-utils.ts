import { Angle } from "gl/utils/angleUtils";
import { IAngleMatrix } from "./IAngleMatrix";
import Matrix from "./Matrix";
import { NumVal } from "core/value/NumVal";

function createAngleMatrix(applyAngle: (matrix: Matrix, angle: Angle) => void, onChange?: () => void): IAngleMatrix {
  const matrix = Matrix.create();
  return {
    angle: new NumVal(0, tilt => {
      applyAngle(matrix, tilt);
      onChange?.();
    }),
    getMatrix() {
      return matrix.getMatrix();
    },
  };
}

export function createTurnMatrix(onChange?: () => void): IAngleMatrix {
  return createAngleMatrix(
    (matrix, angle) => matrix.setYRotation(angle),
    onChange);
}
export function createTiltMatrix(onChange?: () => void): IAngleMatrix {
  return createAngleMatrix(
    (matrix, angle) => matrix.setXRotation(angle),
    onChange);
}
