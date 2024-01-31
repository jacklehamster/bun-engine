import { Vector } from "core/types/Vector";
import { ICollisionDetector } from "./ICollisionDetector";
import { List } from "core/List";

export class CollisionDetectors implements ICollisionDetector {
  private readonly detectors;
  constructor(detectors: List<ICollisionDetector>) {
    this.detectors = detectors;
  }

  isBlocked(to: Vector, from: Vector): boolean {
    const { length } = this.detectors;
    for (let i = 0; i < length; i++) {
      if (this.detectors.at(i)?.isBlocked(to, from)) {
        return true;
      }
    }
    return false;
  }
}
