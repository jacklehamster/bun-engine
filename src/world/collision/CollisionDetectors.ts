import { Vector } from "dok-types";
import { ICollisionDetector } from "dok-matrix";
import { List } from "abstract-list";

export class CollisionDetectors implements ICollisionDetector {
  constructor(private detectors: List<ICollisionDetector>) {
  }

  isBlocked(to: Vector, from: Vector): boolean {
    const len = this.detectors.length.valueOf();
    for (let i = 0; i < len; i++) {
      if (this.detectors.at(i)?.isBlocked(to, from)) {
        return true;
      }
    }
    return false;
  }
}
