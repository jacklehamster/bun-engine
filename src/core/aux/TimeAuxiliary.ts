import { IGraphicsEngine } from "graphics/IGraphicsEngine";
import { FloatUniform } from "graphics/Uniforms";
import { UpdatePayload } from "updates/Refresh";
import { Auxiliary } from "world/aux/Auxiliary";

export class TimeAuxiliary implements Auxiliary {
  constructor(private engine: IGraphicsEngine) {
  }

  refresh(updatePayload: UpdatePayload): void {
    this.engine.updateUniformFloat(FloatUniform.TIME, updatePayload.time);
  }
}
