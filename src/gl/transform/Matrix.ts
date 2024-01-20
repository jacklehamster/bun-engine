import { mat4, quat, vec3 } from 'gl-matrix';
import { IMatrix } from './IMatrix';
import { Vector } from "../../core/types/Vector";
import { Angle } from 'gl/utils/angleUtils';

const DEG_TO_RADIANT = Math.PI / 90;

const tempVec: Vector = [0, 0, 0];
const aTemp = mat4.create();
const bTemp = mat4.create();
const tempQuat = quat.create();

class Matrix implements IMatrix {
  private readonly m4 = Float32Array.from(mat4.create());
  static readonly HIDDEN = Matrix.create().scale(0, 0, 0);
  static readonly IDENTITY = Matrix.create();

  constructor() {
    this.identity();
  }

  static create() {
    return new Matrix();
  }

  copy(matrix: IMatrix): Matrix {
    mat4.copy(this.m4, matrix.getMatrix());
    return this;
  }

  identity(): Matrix {
    mat4.identity(this.m4);
    return this;
  }

  invert(matrix?: IMatrix): Matrix {
    mat4.invert(this.m4, matrix?.getMatrix() ?? this.getMatrix());
    return this;
  }

  multiply(matrix: IMatrix): Matrix {
    mat4.multiply(this.m4, this.m4, matrix.getMatrix());
    return this;
  }

  multiply2(matrix1: IMatrix, matrix2: IMatrix): Matrix {
    mat4.multiply(this.m4, matrix1.getMatrix(), matrix2.getMatrix());
    return this;
  }

  multiply3(matrix1: IMatrix, matrix2: IMatrix, matrix3: IMatrix): Matrix {
    this.multiply2(matrix1, matrix2);
    this.multiply(matrix3);
    return this;
  }

  translate(x: number, y: number, z: number): Matrix {
    const v = tempVec;
    v[0] = x;
    v[1] = y;
    v[2] = z;
    return this.move(v);
  }

  move(vector: Vector): Matrix {
    mat4.translate(this.m4, this.m4, vector);
    return this;
  }

  rotateX(angle: Angle): Matrix {
    mat4.rotateX(this.m4, this.m4, angle);
    return this;
  }

  rotateY(angle: Angle): Matrix {
    mat4.rotateY(this.m4, this.m4, angle);
    return this;
  }

  rotateZ(angle: Angle): Matrix {
    mat4.rotateZ(this.m4, this.m4, angle);
    return this;
  }

  setXRotation(angle: Angle): Matrix {
    mat4.fromXRotation(this.getMatrix(), angle);
    return this;
  }

  setYRotation(angle: Angle): Matrix {
    mat4.fromYRotation(this.getMatrix(), angle);
    return this;
  }

  scale(x: number, y?: number, z?: number): Matrix {
    mat4.scale(this.m4, this.m4, [x, y ?? x, z ?? x]);
    return this;
  }

  perspective(degAngle: number, ratio: number, near: number, far: number): Matrix {
    mat4.perspective(
      this.m4,
      degAngle * DEG_TO_RADIANT,
      ratio,
      near,
      far,
    );
    return this;
  }

  ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
    mat4.ortho(this.m4, left, right, bottom, top, near, far);
    return this;
  }

  combine(matrix1: Matrix, matrix2: Matrix, level: number = .5): Matrix {
    mat4.multiplyScalar(aTemp, matrix1.getMatrix(), 1 - level);
    mat4.multiplyScalar(bTemp, matrix2.getMatrix(), level);
    mat4.add(this.m4, aTemp, bTemp);
    return this;
  }

  static getMoveVector(x: number, y: number, z: number, turnMatrix?: IMatrix): Vector {
    const v = tempVec;
    v[0] = x;
    v[1] = y;
    v[2] = z;
    if (turnMatrix) {
      mat4.getRotation(tempQuat, turnMatrix.getMatrix());
      quat.invert(tempQuat, tempQuat);
      vec3.transformQuat(v, v, tempQuat);
    }
    return v;
  }

  getPosition(): Vector {
    const v = tempVec;
    v[0] = this.m4[12];
    v[1] = this.m4[13];
    v[2] = this.m4[14];
    return v;
  }

  setVector(v: Vector) {
    return this.setPosition(v[0], v[1], v[2]);
  }

  setPosition(x: number, y: number, z: number) {
    this.m4[12] = x;
    this.m4[13] = y;
    this.m4[14] = z;
    return this;
  }

  getMatrix(): Float32Array {
    return this.m4;
  }
}

export default Matrix;
