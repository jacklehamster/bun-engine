import { Duration, Time } from "core/Time";

export interface Val<T> {
  valueOf(time: Time): T;
  setValue?(value: T): this;
  update?(deltaTime: Duration): boolean;
}
