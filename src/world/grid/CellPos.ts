import { Position } from "./Position";

export type CellPos = [number, number, number];
export type Cell = {
  pos: CellPos;
  tag: string;
}

export function cellTag(x: number, y: number, z: number) {
  return `${x}_${y}_${z}`;
}

export function makeCell(pos: Position): Cell {
  return { pos, tag: cellTag(...pos) };
}
