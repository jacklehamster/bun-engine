import { CellPos } from "./CellPos";

export type Tag = string;

export type Cell = {
  pos: CellPos;
  tag: Tag;
}

export function cellTag(x: number, y: number, z: number, cellSize: number) {
  return x + "|" + y + "|" + z + "|" + cellSize;
}
