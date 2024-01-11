import { Refresh } from "./Refresh";
import { MatrixUniform } from "core/graphics/Uniforms";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";

export class CameraUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<MatrixUniform> = new Set();
  constructor(private getCameraMatrix: (type: MatrixUniform) => Float32Array, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: MatrixUniform): void {
    this.motor.registerUpdate(this.withCameraType(type));
  }

  withCameraType(type: MatrixUniform): CameraUpdate {
    this.updatedTypes.add(type);
    return this;
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateCameraMatrix(type, this.getCameraMatrix(type)));
  }
}
