import { Refresh } from "./Refresh";
import { CameraMatrixType } from "gl/camera/Camera";
import { GraphicsEngine } from "../core/GraphicsEngine";
import { UpdateNotifier } from "./UpdateNotifier";
import { Motor } from "core/Motor";

export class CameraUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<CameraMatrixType> = new Set();
  constructor(private getCameraMatrix: (type: CameraMatrixType) => Float32Array, private engine: GraphicsEngine, private motor: Motor) {
  }

  informUpdate(type: CameraMatrixType): void {
    this.motor.registerUpdate(this.withCameraType(type));
  }

  withCameraType(type: CameraMatrixType): CameraUpdate {
    this.updatedTypes.add(type);
    return this;
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateCameraMatrix(type, this.getCameraMatrix(type)));
  }
}
