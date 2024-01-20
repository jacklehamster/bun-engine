import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { FloatUniform } from "graphics/Uniforms";
import { IMotor } from "motor/IMotor";
import { Looper } from "motor/Looper";
import { UpdatePayload } from "updates/UpdatePayload";
import { Auxiliary } from "world/aux/Auxiliary";

interface Props {
  motor: IMotor;
  engine: IGraphicsEngine;
}

export class TimeAuxiliary extends Looper<IGraphicsEngine> implements Auxiliary {
  constructor({ engine, motor }: Props) {
    super(motor, true, engine);
  }

  refresh({ time, data }: UpdatePayload<IGraphicsEngine>): void {
    data.updateUniformFloat(FloatUniform.TIME, time);
  }
}
