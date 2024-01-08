import { Cell } from "world/grid/CellPos";
import { Sprites } from "../Sprites";

export interface SpriteFactory {
  getSpritesAtCell?(cell: Cell): Sprites;
}
