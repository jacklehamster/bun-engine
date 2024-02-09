import { Vector } from "dok-types";
import { BaseUniformHandler, Config, Props } from "./BaseUniformHandler";

export class VectorUniformHandler extends BaseUniformHandler<Vector> {
  constructor(props: Props, config: Config, private vector: Vector) {
    super(props, config, (gl, location, vector) => gl.uniform3fv(location, vector));
  }

  update(): void {
    this.updateValue(this.vector);
  }
}
