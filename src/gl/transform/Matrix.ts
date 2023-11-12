import { mat4 } from 'gl-matrix';

const DEG_TO_RADIANT = Math.PI / 90;

class Matrix {
  private matrix: mat4;

  constructor() {
    this.matrix = mat4.create();
  }

  static create() {
    return new Matrix();
  }

  public translate(x: number, y: number, z: number): Matrix {
    mat4.translate(this.matrix, this.matrix, [x, y, z]);
    return this;
  }

  public rotateX(angle: number): Matrix {
    mat4.rotateX(this.matrix, this.matrix, angle);
    return this;
  }

  public rotateY(angle: number): Matrix {
    mat4.rotateY(this.matrix, this.matrix, angle);
    return this;
  }

  public rotateZ(angle: number): Matrix {
    mat4.rotateZ(this.matrix, this.matrix, angle);
    return this;
  }

  public scale(x: number, y: number, z: number): Matrix {
    mat4.scale(this.matrix, this.matrix, [x, y, z]);
    return this;
  }

  public perspective(degAngle: number, ratio: number, near: number, far: number): Matrix {
    mat4.perspective(
      this.matrix,
      degAngle * DEG_TO_RADIANT,
      ratio,
      near,
      far,
    );
    return this;
  }

  public ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
    mat4.ortho(this.matrix, left, right, bottom, top, near, far);
    return this;
  }

  static aTemp = mat4.create();
  static bTemp = mat4.create();
  static combineMat4(result: mat4, a: mat4, b: mat4, level: number = .5): void {
    mat4.multiplyScalar(this.aTemp, a, 1 - level);
    mat4.multiplyScalar(this.bTemp, b, level);
    mat4.add(result, this.aTemp, this.bTemp);
  }

  public getMatrix(): mat4 {
    return this.matrix;
  }
}

export default Matrix;
