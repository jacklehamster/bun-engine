import { Sprite } from "../Sprite";
import { IUpdatableList } from "list-accumulator";
import { ICollisionDetector, IMatrix } from "dok-matrix";

export interface IBodyModel {
  readonly sprites: IUpdatableList<Sprite>;
  readonly colliders: IUpdatableList<ICollisionDetector>;
}
