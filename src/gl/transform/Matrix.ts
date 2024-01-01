import { mat4, quat, vec3 } from 'gl-matrix';
import { IMatrix } from './IMatrix';
import { Angle } from 'gl/utils/angleUtils';

const DEG_TO_RADIANT = Math.PI / 90;

class Matrix implements IMatrix {
  private m4 = Float32Array.from(mat4.create());
  static readonly EMPTY = Matrix.create();
  static readonly IDENTITY = Matrix.create();

  constructor() {
    this.identity();
  }

  static create() {
    return new Matrix();
  }

  public set(matrix: Matrix): Matrix {
    mat4.copy(this.m4, matrix.getMatrix());
    return this;
  }

  public identity(): Matrix {
    mat4.identity(this.m4);
    return this;
  }

  public invert(matrix?: IMatrix): Matrix {
    mat4.invert(this.m4, matrix?.getMatrix() ?? this.getMatrix());
    return this;
  }

  public multiply(matrix: IMatrix): Matrix {
    mat4.multiply(this.m4, this.m4, matrix.getMatrix());
    return this;
  }

  public multiply2(matrix1: IMatrix, matrix2: IMatrix): Matrix {
    mat4.multiply(this.m4, matrix1.getMatrix(), matrix2.getMatrix());
    return this;
  }

  public multiply3(matrix1: IMatrix, matrix2: IMatrix, matrix3: IMatrix): Matrix {
    this.multiply2(matrix1, matrix2);
    this.multiply(matrix3);
    return this;
  }

  public translate(x: number, y: number, z: number): Matrix {
    mat4.translate(this.m4, this.m4, [x, y, z]);
    return this;
  }

  public translateToMatrix(matrix: Matrix): Matrix {
    const m4 = matrix.getMatrix();
    return this.translate(-m4[12], -m4[13], -m4[14]);
  }

  public rotateX(angle: Angle): Matrix {
    mat4.rotateX(this.m4, this.m4, angle);
    return this;
  }

  public rotateY(angle: Angle): Matrix {
    mat4.rotateY(this.m4, this.m4, angle);
    return this;
  }

  public rotateZ(angle: Angle): Matrix {
    mat4.rotateZ(this.m4, this.m4, angle);
    return this;
  }

  public setXRotation(angle: Angle): Matrix {
    mat4.fromXRotation(this.getMatrix(), angle);
    return this;
  }

  public setYRotation(angle: Angle): Matrix {
    mat4.fromYRotation(this.getMatrix(), angle);
    return this;
  }

  public scale(x: number, y?: number, z?: number): Matrix {
    mat4.scale(this.m4, this.m4, [x, y ?? x, z ?? x]);
    return this;
  }

  public perspective(degAngle: number, ratio: number, near: number, far: number): Matrix {
    mat4.perspective(
      this.m4,
      degAngle * DEG_TO_RADIANT,
      ratio,
      near,
      far,
    );
    return this;
  }

  public ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
    mat4.ortho(this.m4, left, right, bottom, top, near, far);
    return this;
  }

  private static aTemp = mat4.create();
  private static bTemp = mat4.create();
  combine(matrix1: Matrix, matrix2: Matrix, level: number = .5): Matrix {
    mat4.multiplyScalar(Matrix.aTemp, matrix1.getMatrix(), 1 - level);
    mat4.multiplyScalar(Matrix.bTemp, matrix2.getMatrix(), level);
    mat4.add(this.m4, Matrix.aTemp, Matrix.bTemp);
    return this;
  }

  static tempQuat = quat.create();
  static tempVec = vec3.create();
  moveMatrix(x: number, y: number, z: number, turnMatrix?: IMatrix) {
    const v = Matrix.tempVec;
    v[0] = x;
    v[1] = y;
    v[2] = z;
    if (turnMatrix) {
      mat4.getRotation(Matrix.tempQuat, turnMatrix.getMatrix());
      quat.invert(Matrix.tempQuat, Matrix.tempQuat);
      vec3.transformQuat(v, v, Matrix.tempQuat);
    }
    mat4.translate(this.m4, this.m4, v);
    return this;
  }

  setPosition(x: number, y: number, z: number) {
    this.m4[12] = x;
    this.m4[13] = y;
    this.m4[14] = z;
  }

  getMatrix(): Float32Array {
    return this.m4;
  }
}

export default Matrix;
