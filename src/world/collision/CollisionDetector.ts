import { Vector } from "core/types/Vector";
import { ICollisionDetector } from "./ICollisionDetector";
import { Box, NULLBOX } from "./Box";
import { CollisionBox } from "./CollisionBox";

export class CollisionDetector implements ICollisionDetector {
  private collisionBox: CollisionBox;
  private heroCollisionBox: CollisionBox;
  private blocked = false;
  constructor(blockerBox: Box, blockerPosition: Vector, heroBox: Box = NULLBOX, private onBlockChange?: (blocked: boolean) => void) {
    this.collisionBox = new CollisionBox(blockerBox, blockerPosition);
    this.heroCollisionBox = new CollisionBox(heroBox, [0, 0, 0]);
  }

  isBlocked(to: Vector): boolean {
    this.heroCollisionBox.position[0] = to[0];
    this.heroCollisionBox.position[1] = to[1];
    this.heroCollisionBox.position[2] = to[2];
    const blocked = this.heroCollisionBox.collideWith(this.collisionBox);
    if (blocked !== this.blocked) {
      this.blocked = blocked;
      this.onBlockChange?.(this.blocked);
    }
    return blocked;
  }
}
