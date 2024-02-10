import { IMatrix } from "dok-matrix";
import { BaseUniformHandler, Config, Props } from "./BaseUniformHandler";

export class MatrixUniformHandler extends BaseUniformHandler<IMatrix> {
  constructor(props: Props, config: Config, private matrix: IMatrix) {
    super(props, config, (gl, location, matrix) => gl.uniformMatrix4fv(location, false, matrix.getMatrix()))
  }

  update(): void {
    this.updateValue(this.matrix);
  }
}
