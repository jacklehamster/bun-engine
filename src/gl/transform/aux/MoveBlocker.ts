import { Vector } from "../../../core/types/Vector";

export interface MoveBlocker {
  isBlocked(to: Vector, from?: Vector): boolean;
}
