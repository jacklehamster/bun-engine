import { IMatrix } from "./IMatrix";
import { Vector } from "../../core/types/Vector";
import { ICollisionDetector } from "../../world/collision/ICollisionDetector";
import { Auxiliary } from "world/aux/Auxiliary";
import { Holder } from "world/aux/Holder";

export type ChangeListener = (dx: number, dy: number, dz: number) => void;
export interface IPositionMatrix extends IMatrix, Auxiliary, Holder<IPositionMatrix> {
  moveBy(x: number, y: number, z: number, turnMatrix?: IMatrix): boolean;
  moveTo(x: number, y: number, z: number): boolean;
  gotoPos(x: number, y: number, z: number, speed?: number): boolean;
  movedTo(x: number, y: number, z: number): this;
  get position(): Vector;
  onChange(listener: ChangeListener): this;
  removeChangeListener(listener: ChangeListener): void;
  moveBlocker?: ICollisionDetector;
}
