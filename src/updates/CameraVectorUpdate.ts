import { Refresh } from "./Refresh";
import { VectorUniform } from "core/graphics/Uniforms";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";
import { vector } from "gl/transform/IMatrix";

export class CameraVectorUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<VectorUniform> = new Set();
  constructor(private getCameraVector: (type: VectorUniform) => vector, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: VectorUniform): void {
    this.motor.registerUpdate(this.withCameraType(type));
  }

  withCameraType(type: VectorUniform): CameraVectorUpdate {
    this.updatedTypes.add(type);
    return this;
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateUniformVector(type, this.getCameraVector(type)));
  }
}
