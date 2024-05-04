import { TIME_LOC } from "gl/attributes/Constants";
import { FloatUniformHandler } from "gl/uniforms/update/FloatUniformHandler";
import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { IMotor, Looper, UpdatePayload } from "motor-loop";
import { Active } from "dok-types";

interface Props {
  motor: IMotor;
  engine: IGraphicsEngine;
}

export class TimeAuxiliary extends Looper<FloatUniformHandler> implements Active {
  constructor({ engine, motor }: Props) {
    super({ motor, data: engine.createFloatUniformHandler(TIME_LOC) }, { autoStart: true });
  }

  refresh({ time, data, renderFrame }: UpdatePayload<FloatUniformHandler>): void {
    if (renderFrame) {
      data.updateValue(time);
    }
  }
}
