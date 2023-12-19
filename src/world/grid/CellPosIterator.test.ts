import { describe, expect, it } from "bun:test";
import { CellPosIterator } from "./CellPosIterator";
import { CellPos } from "./Cell";

class CellIterable implements Iterable<CellPos> {
  constructor(private dist: number) {
  }

  [Symbol.iterator](): Iterator<CellPos> {
    return new CellPosIterator(this.dist);
  }
}

describe('CellPosIterator', () => {
  it('should iterate from inside to outside', () => {
    const iterable = new CellIterable(5);
    let prevManDist = -1;
    const visited = new Set<string>();

    for (const cellPos of iterable) {
      expect(visited.has(cellPos.join(","))).toBe(false);
      visited.add(cellPos.join(","));

      const manDist = cellPos.map(n => Math.abs(n)).reduce((a, b) => a + b, 0);
      expect(prevManDist <= manDist).toBe(true);
    }
  });
});
