import { Sprite } from "../Sprite";
import { IUpdatableList } from "list-accumulator";
import { ICollisionDetector } from "dok-matrix";

export interface IBodyModel {
  readonly sprites: IUpdatableList<Sprite>;
  readonly colliders: IUpdatableList<ICollisionDetector>;
}
