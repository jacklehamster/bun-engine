import { Position } from "world/grid/Position";

export interface MoveBlocker {
  isBlocked(to: Position, from?: Position): boolean;
}
