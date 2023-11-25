import { mat4, quat, vec3 } from 'gl-matrix';

const DEG_TO_RADIANT = Math.PI / 90;

class Matrix {
  private matrix = Float32Array.from(mat4.create());

  constructor() {
    mat4.identity(this.matrix);
  }

  static create() {
    return new Matrix();
  }

  public identity(): Matrix {
    mat4.identity(this.matrix);
    return this;
  }

  public copy(matrix: mat4): Matrix {
    mat4.copy(this.matrix, matrix);
    return this;
  }

  public invert(): Matrix {
    mat4.invert(this.matrix, this.matrix);
    return this;
  }

  public multiply(matrix: mat4): Matrix {
    mat4.multiply(this.matrix, this.matrix, matrix);
    return this;
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

  static tempQuat = quat.create();
  static moveMatrix(result: mat4, x: number, y: number, z: number,
    turnMatrix: mat4 | null = null) {
    const v = vec3.fromValues(-x, y, z);
    if (turnMatrix) {
      mat4.getRotation(this.tempQuat, turnMatrix);
      quat.invert(this.tempQuat, this.tempQuat);
      vec3.transformQuat(v, v, this.tempQuat);
    }
    mat4.translate(result, result, v);
  }

  public getMatrix(): Float32Array {
    return this.matrix;
  }
}

export default Matrix;
