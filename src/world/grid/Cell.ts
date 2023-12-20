import { Sprites } from "world/sprite/Sprites";

export type CellPos = [number, number, number];

export interface Cell {
  pos: CellPos;
  getSpriteUpdates(time: number): Sprites;
}
