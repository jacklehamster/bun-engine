import { BaseUniformHandler, Config, Props } from "./BaseUniformHandler";
import { Val } from "dok-types";

export class FloatUniformHandler extends BaseUniformHandler<number> {
  constructor(props: Props, config: Config, private val?: Val<number>) {
    super(props, config, (gl, location, value) => gl.uniform1f(location, value));
    if (val === undefined) {
      this.update = () => { };
    }
  }

  update(): void {
    this.updateValue(this.val!.valueOf());
  }
}
