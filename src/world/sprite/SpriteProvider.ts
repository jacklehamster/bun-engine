import { Time } from "core/Motor";
import { SpriteId } from "world/sprite/Sprite";
import { List } from "world/sprite/List";
import { CellPos } from "../grid/CellPos";
import { Sprites } from "world/sprite/Sprites";

export interface SpriteProvider extends Sprites {
  getUpdatedSprites(position: CellPos, lastUpdate: Time): List<SpriteId>;
}
