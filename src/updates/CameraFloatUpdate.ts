import { Refresh } from "./Refresh";
import { FloatUniform } from "core/graphics/Uniforms";
import { UpdateNotifier } from "./UpdateNotifier";
import { IGraphicsEngine } from "core/graphics/IGraphicsEngine";
import { IMotor } from "core/motor/IMotor";

export class CameraFloatUpdate implements Refresh, UpdateNotifier {
  private readonly updatedTypes: Set<FloatUniform> = new Set();
  constructor(private getCameraFloat: (type: FloatUniform) => number, private engine: IGraphicsEngine, private motor: IMotor) {
  }

  informUpdate(type: FloatUniform): void {
    this.motor.registerUpdate(this.withCameraType(type));
  }

  withCameraType(type: FloatUniform): CameraFloatUpdate {
    this.updatedTypes.add(type);
    return this;
  }

  refresh(): void {
    this.updatedTypes.forEach(type => this.engine.updateUniformFloat(type, this.getCameraFloat(type)));
  }
}
