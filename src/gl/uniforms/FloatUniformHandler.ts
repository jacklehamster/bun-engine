import { BaseUniformHandler, Config, Props } from "./BaseUniformHandler";
import { Val } from "core/value/Val";

export class FloatUniformHandler extends BaseUniformHandler<number> {
  constructor(props: Props, config: Config, private val?: Val<number>) {
    super(props, config, (gl, location, value) => gl.uniform1f(location, value));
    if (val === undefined) {
      this.update = () => { throw new Error("Illegal call.") };
    }
  }

  update(): void {
    this.updateValue(this.val!.valueOf());
  }
}
