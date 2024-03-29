import { Vector } from "dok-types";
import { IBox } from "./IBox";

export class CollisionBox implements IBox {
  constructor(private readonly box: IBox, public readonly position: Vector) {
  }

  collideWith(box: IBox) {
    return this.right > box.left && box.right > this.left
      && this.top > box.bottom && box.top > this.bottom
      && this.near > box.far && box.near > this.far;
  }

  gotoPosition(pos: Vector) {
    this.position[0] = pos[0];
    this.position[1] = pos[1];
    this.position[2] = pos[2];
  }

  get top(): number {
    return this.box.top + this.position[1];
  }
  get bottom(): number {
    return this.box.bottom + this.position[1];
  }
  get left(): number {
    return this.box.left + this.position[0];
  }
  get right(): number {
    return this.box.right + this.position[0];
  }
  get near(): number {
    return this.box.near + this.position[2];
  }
  get far(): number {
    return this.box.far + this.position[2];
  }
}
