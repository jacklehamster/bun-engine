import { Vector } from "core/types/Vector";
import { Box } from "./Box";

export class CollisionBox implements Box {
  constructor(private readonly box: Box, public readonly position: Vector) {
  }

  collideWith(box: Box) {
    return this.right > box.left && box.right > this.left
      && this.top > box.bottom && box.top > this.bottom
      && this.near > box.far && box.near > this.far;
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
