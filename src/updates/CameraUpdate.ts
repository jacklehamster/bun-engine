import { Refresh } from "./Refresh";
import { CameraMatrixType } from "gl/camera/Camera";
import { GraphicsEngine } from "../core/GraphicsEngine";

export class CameraUpdate implements Refresh {
  private readonly updatedTypes: Set<CameraMatrixType> = new Set();
  constructor(private getCameraMatrix: (type: CameraMatrixType) => Float32Array, private engine: GraphicsEngine) {
  }

  withCameraType(type: CameraMatrixType): CameraUpdate {
    this.updatedTypes.add(type);
    return this;
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateCameraMatrix(type, this.getCameraMatrix(type)));
  }
}
