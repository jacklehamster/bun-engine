import { Position } from "world/grid/Position";
import { IMatrix } from "./IMatrix";

export interface IPositionMatrix extends IMatrix {
  moveBy(x: number, y: number, z: number, turnMatrix?: IMatrix): void;
  moveTo(x: number, y: number, z: number): void;
  gotoPos(x: number, y: number, z: number, speed?: number): boolean;
  get position(): Position;
}
