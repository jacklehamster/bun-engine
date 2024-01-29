import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { FloatUniform } from "graphics/Uniforms";
import { IMotor, Looper, UpdatePayload } from "motor-loop";
import { Auxiliary } from "world/aux/Auxiliary";

interface Props {
  motor: IMotor;
  engine: IGraphicsEngine;
}

export class TimeAuxiliary extends Looper<IGraphicsEngine> implements Auxiliary {
  constructor({ engine, motor }: Props) {
    super({ motor, data: engine }, { autoStart: true });
  }

  refresh({ time, data }: UpdatePayload<IGraphicsEngine>): void {
    data.updateUniformFloat(FloatUniform.TIME, time);
  }
}
