import { Refresh } from "./Refresh";
import { VectorUniform } from "graphics/Uniforms";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { vector } from "gl/transform/IMatrix";

export class CameraVectorUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<VectorUniform> = new Set();
  constructor(private getCameraVector: (type: VectorUniform) => vector, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: VectorUniform): void {
    if (!this.updatedTypes.has(type)) {
      this.updatedTypes.add(type);
      this.motor.registerUpdate(this);
    }
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateUniformVector(type, this.getCameraVector(type)));
    this.updatedTypes.clear();
  }
}
