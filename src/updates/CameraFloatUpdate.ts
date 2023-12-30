import { Refresh } from "./Refresh";
import { CameraFloatType } from "gl/camera/Camera";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";

export class CameraFloatUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<CameraFloatType> = new Set();
  constructor(private getCameraFloat: (type: CameraFloatType) => number, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: CameraFloatType): void {
    this.motor.registerUpdate(this.withCameraType(type));
  }

  withCameraType(type: CameraFloatType): CameraFloatUpdate {
    this.updatedTypes.add(type);
    return this;
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateCameraFloat(type, this.getCameraFloat(type)));
  }
}
