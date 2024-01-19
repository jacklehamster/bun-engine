import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { FloatUniform } from "graphics/Uniforms";
import { IMotor } from "motor/IMotor";
import { Looper } from "motor/Looper";
import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "world/aux/Auxiliary";

interface Props {
  motor: IMotor;
  engine: IGraphicsEngine;
}

export class TimeAuxiliary extends Looper implements Auxiliary {
  private readonly engine: IGraphicsEngine;
  constructor({ engine, motor }: Props) {
    super(motor, true);
    this.engine = engine;
  }

  refresh(updatePayload: UpdatePayload): void {
    this.engine.updateUniformFloat(FloatUniform.TIME, updatePayload.time);
  }
}
