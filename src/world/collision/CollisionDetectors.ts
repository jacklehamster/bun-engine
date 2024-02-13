import { Vector } from "dok-types";
import { ICollisionDetector } from "dok-matrix";
import { List } from "abstract-list";

export class CollisionDetectors implements ICollisionDetector {
  constructor(private detectors: List<ICollisionDetector>) {
  }

  isBlocked(to: Vector, from: Vector): boolean {
    const { length } = this.detectors;
    for (let i = 0; i < length.valueOf(); i++) {
      if (this.detectors.at(i)?.isBlocked(to, from)) {
        return true;
      }
    }
    return false;
  }
}
