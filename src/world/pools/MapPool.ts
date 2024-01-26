import { ObjectPool } from "utils/ObjectPool";

export class MapPool<K, T> extends ObjectPool<Map<K, T>, []> {
  constructor() {
    super(elem => {
      if (!elem) {
        return new Map();
      }
      return elem;
    }, elem => elem.clear());
  }
}
