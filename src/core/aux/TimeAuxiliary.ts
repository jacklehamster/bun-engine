import { TIME_LOC } from "gl/attributes/Constants";
import { FloatUniformHandler } from "gl/uniforms/FloatUniformHandler";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor, Looper, UpdatePayload } from "motor-loop";
import { Auxiliary } from "world/aux/Auxiliary";

interface Props {
  motor: IMotor;
  engine: IGraphicsEngine;
}

export class TimeAuxiliary extends Looper<FloatUniformHandler> implements Auxiliary {
  constructor({ engine, motor }: Props) {
    super({ motor, data: engine.createFloatUniformHandler(TIME_LOC) }, { autoStart: true });
  }

  refresh({ time, data }: UpdatePayload<FloatUniformHandler>): void {
    data.updateValue(time);
  }
}
