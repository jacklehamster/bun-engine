import { AuxiliaryHolder } from "world/aux/AuxiliaryHolder";
import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { NumVal as NumValue } from "core/value/NumVal";
import { Val } from "core/value/Val";

const DEFAULT_PERSPECTIVE_LEVEL = 1;
const DEFAULT_ZOOM = 1;

export class ProjectionMatrix extends AuxiliaryHolder<ProjectionMatrix> implements IMatrix {
  private readonly baseMatrix = Matrix.create();
  private readonly perspectiveMatrix = Matrix.create();
  private readonly orthoMatrix = Matrix.create();
  private readonly perspectiveLevel: Val<number>;
  private readonly zoom: Val<number>;
  private _width: number = 0;
  private _height: number = 0;

  constructor(private onChange?: () => void) {
    super();
    this.perspectiveLevel = new NumValue(DEFAULT_PERSPECTIVE_LEVEL, onChange);
    this.zoom = new NumValue(DEFAULT_ZOOM, onChange);
  }

  private configPerspectiveMatrix(angle: number, ratio: number, near: number, far: number) {
    this.perspectiveMatrix.perspective(angle, ratio, near, far);
  }

  private configOrthoMatrix(width: number, height: number, near: number, far: number) {
    this.orthoMatrix.ortho(-width / 2, width / 2, -height / 2, height / 2, near, far);
  }

  configure(width: number, height: number, zoom: number = 1, near = 0.5, far = 1000) {
    if (this._width !== width || this._height !== height || this.zoom.valueOf() !== zoom) {
      this._width = width; this._height = height;
      this.zoom.setValue?.(zoom);
      const ratio: number = width / height;
      const angle = 45 / Math.sqrt(zoom);
      this.configPerspectiveMatrix(angle, ratio, Math.max(near, 0.00001), far);
      this.configOrthoMatrix(ratio / zoom / zoom, 1 / zoom / zoom, -far, far);
      this.onChange?.();
    }
  }

  setZoom(zoom: number) {
    this.configure(this._width, this._height, zoom);
  }

  getMatrix(): Float32Array {
    this.baseMatrix.combine(this.orthoMatrix, this.perspectiveMatrix, this.perspectiveLevel.valueOf());
    return this.baseMatrix.getMatrix();
  }
}
