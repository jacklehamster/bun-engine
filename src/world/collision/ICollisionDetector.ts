import { Vector } from "../../core/types/Vector";

export interface ICollisionDetector {
  isBlocked?(to: Vector, from: Vector): boolean;
  didEnter?(to: Vector, from: Vector): boolean;
}
