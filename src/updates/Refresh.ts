import { Duration } from "core/Time";
import { Time } from "core/Time";
import { Priority } from "./Priority";

export interface UpdatePayload {
  time: Time;
  deltaTime: Duration;
}

export type Refresh = {
  readonly refresh?: (updatePayload: UpdatePayload) => void;
  priority?: Priority;
}
