import { Progressive } from "./Progressive";
import { NumVal } from "./NumVal";
import { ObjectPool } from "bun-pool";

export class ProgressivePool extends ObjectPool<Progressive<NumVal>, [NumVal]> {
  constructor() {
    super((progressive, val) => {
      if (!progressive) {
        return new Progressive(val, elem => elem.valueOf(), (elem, value) => elem.setValue(value));
      }
      progressive.element = val;
      return progressive;
    });
  }
}
