import { Box } from "./Box";

export class CollisionBox implements Box {
  constructor(private box: Box) {

  }

  collideWith(box: Box) {
    return this.right > box.left && box.right > this.left
      && this.top > box.bottom && box.top > this.bottom
      && this.near > box.far && this.far > box.near;
  }

  get top(): number {
    return this.box.top;
  }
  get bottom(): number {
    return this.box.bottom;
  }
  get left(): number {
    return this.box.left;
  }
  get right(): number {
    return this.box.right;
  }
  get near(): number {
    return this.box.near;
  }
  get far(): number {
    return this.box.far;
  }
}
