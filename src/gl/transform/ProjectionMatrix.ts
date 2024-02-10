import { IMatrix } from "./IMatrix";
import Matrix from "./Matrix";
import { NumVal } from "core/value/NumVal";

const DEFAULT_PERSPECTIVE_LEVEL = 1;
const DEFAULT_ZOOM = 1;

export class ProjectionMatrix implements IMatrix {
  readonly #baseMatrix = Matrix.create();
  readonly #perspectiveMatrix = Matrix.create();
  readonly #orthoMatrix = Matrix.create();
  readonly #size: [number, number] = [0, 0];
  readonly perspective: NumVal;
  readonly zoom: NumVal;

  constructor(private onChange?: () => void) {
    this.perspective = new NumVal(DEFAULT_PERSPECTIVE_LEVEL, onChange);
    this.zoom = new NumVal(DEFAULT_ZOOM, zoom => {
      this.configure(this.#size, zoom);
    });
  }

  private configPerspectiveMatrix(angle: number, ratio: number, near: number, far: number) {
    this.#perspectiveMatrix.perspective(angle, ratio, near, far);
  }

  private configOrthoMatrix(width: number, height: number, near: number, far: number) {
    this.#orthoMatrix.ortho(-width / 2, width / 2, -height / 2, height / 2, near, far);
  }

  configure(size: [number, number], zoom?: number, near = 0.5, far = 10000) {
    if (!zoom) {
      zoom = this.zoom.valueOf();
    }
    this.#size[0] = size[0];
    this.#size[1] = size[1];
    const ratio: number = this.#size[0] / this.#size[1];
    const angle = 45 / Math.sqrt(zoom);
    this.configPerspectiveMatrix(angle, ratio, Math.max(near, 0.00001), far);
    this.configOrthoMatrix(ratio / zoom / zoom, 1 / zoom / zoom, -far, far);
    this.onChange?.();
  }

  getMatrix(): Float32Array {
    this.#baseMatrix.combine(this.#orthoMatrix, this.#perspectiveMatrix, this.perspective.valueOf());
    return this.#baseMatrix.getMatrix();
  }
}
