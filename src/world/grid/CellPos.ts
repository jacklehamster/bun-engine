import { Position } from "./Position";

export type CellPos = [number, number, number, number];
export type Cell = {
  pos: CellPos;
  tag: string;
}

export function cellTag(x: number, y: number, z: number, cellSize: number) {
  return `(${x},${y},${z})_${cellSize}`;
}

const cellPos: CellPos = [0, 0, 0, 0];
export function getCellPos(pos: Position, cellSize: number): CellPos {
  cellPos[0] = Math.round(pos[0] / cellSize);
  cellPos[1] = Math.round(pos[1] / cellSize);
  cellPos[2] = Math.round(pos[2] / cellSize);
  cellPos[3] = cellSize;
  return cellPos;
}

const tempPos: Position = [0, 0, 0];
export function positionFromCell(cellPos: CellPos): Position {
  const [cx, cy, cz, cellSize] = cellPos;
  tempPos[0] = cx * cellSize;
  tempPos[1] = cy * cellSize;
  tempPos[2] = cz * cellSize;
  return tempPos;
}
