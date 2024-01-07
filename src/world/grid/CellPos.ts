export type CellPos = [number, number, number, number];
export type Cell = {
  pos: CellPos;
  tag: string;
}

export function cellTag(x: number, y: number, z: number, cellSize: number) {
  return `(${x},${y},${z})_${cellSize}`;
}
