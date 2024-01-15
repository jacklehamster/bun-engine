import { Refresh, UpdatePayload } from "./Refresh";
import { FloatUniform } from "graphics/Uniforms";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor } from "motor/IMotor";
import { Val } from "core/value/Val";

export class CameraFloatUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<FloatUniform> = new Set();
  constructor(private getCameraFloat: (type: FloatUniform) => Val<number>, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: FloatUniform): void {
    if (!this.updatedTypes.has(type)) {
      this.updatedTypes.add(type);
      this.motor.registerUpdate(this);
    }
  }

  refresh(updatePayload: UpdatePayload): void {
    this.updatedTypes.forEach(type => this.engine.updateUniformFloat(type, this.getCameraFloat(type).valueOf(updatePayload.time)));
    this.updatedTypes.clear();
  }
}
