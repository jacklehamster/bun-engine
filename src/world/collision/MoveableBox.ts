import { IPositionMatrix } from "dok-matrix";
import { IBox } from "./IBox";


export class MoveableBox implements IBox {
  constructor(private box: IBox, private positionMatrix: IPositionMatrix) {
  }

  get top(): number {
    return this.box.top + this.positionMatrix.position[1];
  }
  get bottom(): number {
    return this.box.bottom + this.positionMatrix.position[1];
  }
  get left(): number {
    return this.box.left + this.positionMatrix.position[0];
  }
  get right(): number {
    return this.box.right + this.positionMatrix.position[0];
  }
  get near(): number {
    return this.box.near + this.positionMatrix.position[2];
  }
  get far(): number {
    return this.box.far + this.positionMatrix.position[2];
  }
  get disabled(): boolean | undefined {
    return this.box.disabled;
  }
}
