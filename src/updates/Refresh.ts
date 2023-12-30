import { Duration } from "core/Time";
import { Time } from "core/Time";

export interface UpdatePayload {
  time: Time;
  deltaTime: Duration;
}

export type Refresh = {
  refresh(updatePayload: UpdatePayload): void;
}
