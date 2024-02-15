import { ICollisionDetector } from "dok-matrix";
import { UpdatableList } from "../core/UpdatableList";
import { Sprite } from "./sprite/Sprite";
import { Active } from "dok-types";
import { Cycle } from "motor-loop";

export interface IWorld extends Active {
  sprites: UpdatableList<Sprite>;
  colliders: UpdatableList<ICollisionDetector>;
  cycles: UpdatableList<Cycle>;
}
