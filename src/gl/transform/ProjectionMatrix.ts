import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

export class ProjectionMatrix implements IMatrix {
  private readonly baseMatrix = Matrix.create();
  private readonly perspectiveMatrix = Matrix.create();
  private readonly orthoMatrix = Matrix.create();
  private perspectiveLevel = 1;

  private configPerspectiveMatrix(ratio: number) {
    this.perspectiveMatrix.perspective(45, ratio, 0.01, 100000);
  }

  private configOrthoMatrix(ratio: number) {
    this.orthoMatrix.ortho(-ratio, ratio, -1, 1, -100000, 100000);
  }

  configure(width: number, height: number) {
    const ratio: number = width / height;
    this.configPerspectiveMatrix(ratio);
    this.configOrthoMatrix(ratio);
  }

  setPerspective(level: number) {
    this.perspectiveLevel = level;
  }

  getMatrix(): Float32Array {
    this.baseMatrix.combine(this.orthoMatrix, this.perspectiveMatrix, this.perspectiveLevel);
    return this.baseMatrix.getMatrix();
  }
}
