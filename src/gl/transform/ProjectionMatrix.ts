import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";

export class ProjectionMatrix extends AuxiliaryHolder<ProjectionMatrix> implements IMatrix {
  private readonly baseMatrix = Matrix.create();
  private readonly perspectiveMatrix = Matrix.create();
  private readonly orthoMatrix = Matrix.create();
  private _perspectiveLevel = 1;
  private _zoom = 1;
  private _width: number = 0;
  private _height: number = 0;

  constructor(private onChange?: () => void) {
    super();
  }

  private configPerspectiveMatrix(angle: number, ratio: number, near: number, far: number) {
    this.perspectiveMatrix.perspective(angle, ratio, near, far);
  }

  private configOrthoMatrix(width: number, height: number, near: number, far: number) {
    this.orthoMatrix.ortho(-width / 2, width / 2, -height / 2, height / 2, near, far);
  }

  configure(width: number, height: number, zoom: number = 1, near = 0.5, far = 1000) {
    if (this._width !== width || this._height !== height || this._zoom !== zoom) {
      this._width = width; this._height = height;
      this._zoom = zoom;
      const ratio: number = width / height;
      const angle = 45 / Math.sqrt(this._zoom);
      this.configPerspectiveMatrix(angle, ratio, Math.max(near, 0.00001), far);
      this.configOrthoMatrix(ratio / this._zoom / this._zoom, 1 / this._zoom / this._zoom, -far, far);
      this.onChange?.();
    }
  }

  setPerspective(level: number) {
    this._perspectiveLevel = level;
    this.onChange?.();
  }

  setZoom(zoom: number) {
    this.configure(this._width, this._height, zoom);
  }

  getMatrix(): Float32Array {
    this.baseMatrix.combine(this.orthoMatrix, this.perspectiveMatrix, this._perspectiveLevel);
    return this.baseMatrix.getMatrix();
  }
}
