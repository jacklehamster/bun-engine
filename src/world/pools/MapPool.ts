import { ObjectPool } from "bun-pool";

export class MapPool<K, T> extends ObjectPool<Map<K, T>, []> {
  constructor() {
    super(elem => {
      if (!elem) {
        return new Map<K, T>();
      }
      return elem;
    }, elem => elem.clear());
  }
}
