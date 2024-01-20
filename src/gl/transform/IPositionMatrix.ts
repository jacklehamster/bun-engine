import { IMatrix } from "./IMatrix";
import { Vector } from "../../core/types/Vector";
import { MoveBlocker } from "../../world/collision/MoveBlocker";

export type ChangeListener = (dx: number, dy: number, dz: number) => void;
export interface IPositionMatrix extends IMatrix {
  moveBy(x: number, y: number, z: number, turnMatrix?: IMatrix): void;
  moveTo(x: number, y: number, z: number): void;
  gotoPos(x: number, y: number, z: number, speed?: number): boolean;
  get position(): Vector;
  onChange(listener: ChangeListener): this;
  removeChangeListener(listener: ChangeListener): void;
  moveBlocker?: MoveBlocker;
}
