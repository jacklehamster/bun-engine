import { Duration } from "core/Time";

export interface Val<T> {
  valueOf(): T;
  setValue?(value: T): this;
  update?(deltaTime: Duration): boolean;
}
