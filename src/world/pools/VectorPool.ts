import { ObjectPool } from "bun-pool";
import { Vector } from "core/types/Vector";

export class VectorPool extends ObjectPool<Vector, [number, number, number]> {
  constructor() {
    super((vector, x, y, z) => {
      if (!vector) {
        return [x, y, z];
      }
      vector[0] = x;
      vector[1] = y;
      vector[2] = z;
      return vector;
    });
  }
}
