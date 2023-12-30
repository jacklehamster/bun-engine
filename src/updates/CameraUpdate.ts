import { Refresh } from "./Refresh";
import { CameraMatrixType } from "gl/camera/Camera";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";

export class CameraUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<CameraMatrixType> = new Set();
  constructor(private getCameraMatrix: (type: CameraMatrixType) => Float32Array, private engine: IGraphicsEngine, private motor: IMotor) {
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
