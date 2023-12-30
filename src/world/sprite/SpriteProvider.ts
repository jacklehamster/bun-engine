import { Time } from "core/motor/Motor";
import { SpriteId } from "world/sprite/Sprite";
import { List } from "world/sprite/List";
import { CellPos } from "../grid/CellPos";
import { Sprites } from "world/sprite/Sprites";
import { Auxiliary } from "world/aux/Auxiliary";

export interface SpriteProvider extends Sprites, Auxiliary {
  getUpdatedSprites(position: CellPos, lastUpdate: Time): List<SpriteId>;
}
