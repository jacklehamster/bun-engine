import { Sprites } from "world/sprite/Sprite";

export type CellPos = [number, number, number];

export interface Cell {
  pos: CellPos;
  sprites: Sprites;
}
