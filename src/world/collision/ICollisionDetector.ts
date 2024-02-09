import { Vector } from "dok-types";

export interface ICollisionDetector {
  isBlocked(to: Vector, from: Vector): boolean;
}
