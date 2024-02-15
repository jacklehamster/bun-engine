import { ICollisionDetector } from "dok-matrix";
import { UpdatableList } from "../core/UpdatableList";
import { Sprite } from "./sprite/Sprite";
import { Active } from "dok-types";

export interface IWorld extends Active {
  sprites: UpdatableList<Sprite>;
  colliders: UpdatableList<ICollisionDetector>;
}
