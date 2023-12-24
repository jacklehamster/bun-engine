import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

export class ProjectionMatrix implements IMatrix {
  private readonly baseMatrix = Matrix.create();
  private readonly perspectiveMatrix = Matrix.create();
  private readonly orthoMatrix = Matrix.create();
  private perspectiveLevel = 1;

  private configPerspectiveMatrix(ratio: number) {
    this.perspectiveMatrix.perspective(45, ratio, 0.01, 1000);
  }

  private configOrthoMatrix(ratio: number) {
    this.orthoMatrix.ortho(-ratio, ratio, -1, 1, -1000, 1000);
  }

  configure(width: number, height: number) {
    const ratio: number = width / height;
    this.configPerspectiveMatrix(ratio);
    this.configOrthoMatrix(ratio);
  }

  setPerspective(level: number) {
    this.perspectiveLevel = level;
    this.baseMatrix.combine(this.orthoMatrix, this.perspectiveMatrix, this.perspectiveLevel);
  }

  getMatrix(): Float32Array {
    return this.baseMatrix.getMatrix();
  }
}
