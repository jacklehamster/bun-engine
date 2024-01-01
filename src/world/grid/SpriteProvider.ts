import { Time } from "core/Time";
import { SpriteId } from "world/sprite/Sprite";
import { List } from "world/sprite/List";
import { Cell } from "./CellPos";
import { Sprites } from "world/sprite/Sprites";
import { Auxiliary } from "world/aux/Auxiliary";

export interface SpriteProvider extends Sprites, Auxiliary {
  getUpdatedSprites(cell: Cell, lastUpdate: Time): List<SpriteId>;
}
