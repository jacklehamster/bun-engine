export type Tag = string;

export type Cell = {
  pos: [number, number, number, number];
  tag: Tag;
}

export function cellTag(x: number, y: number, z: number, cellSize: number) {
  return x + "," + y + "," + z + "|" + cellSize;
}
