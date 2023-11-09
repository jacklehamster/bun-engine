import { mat4 } from 'gl-matrix';

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

  public getMatrix(): mat4 {
    return this.matrix;
  }
}

export default Matrix;
