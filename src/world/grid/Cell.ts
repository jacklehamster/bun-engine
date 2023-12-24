import { Time } from "core/Motor";
import { SpriteId } from "world/sprite/Sprite";
import { CellPos } from "./CellPos";
import { List } from "world/sprite/List";

export interface Cell {
  pos: CellPos;
  getSpriteUpdates(lastUpdate: Time): List<SpriteId>;
}
