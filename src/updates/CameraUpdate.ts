import { Refresh } from "./Refresh";
import { MatrixUniform } from "graphics/Uniforms";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";

export class CameraUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<MatrixUniform> = new Set();
  constructor(private getCameraMatrix: (type: MatrixUniform) => Float32Array, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: MatrixUniform): void {
    if (!this.updatedTypes.has(type)) {
      this.updatedTypes.add(type);
      this.motor.registerUpdate(this);
    }
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateUniformMatrix(type, this.getCameraMatrix(type)));
    this.updatedTypes.clear();
  }
}
