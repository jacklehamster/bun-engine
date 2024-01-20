import { Duration } from "core/Time";
import { Time } from "core/Time";
import { Priority } from "./Priority";

export interface UpdatePayload<T = undefined> {
  time: Time;
  deltaTime: Duration;
  data: T;
  renderFrame: boolean;
}

export interface Refresh<T = undefined> {
  readonly refresh: (updatePayload: UpdatePayload<T>) => void;
  priority?: Priority;
}
